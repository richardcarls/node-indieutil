var _ = require('lodash');

var jf2EmbedRefs = require('./jf2-embed-refs');

var compactExclude = {
  entry: [
    'in-reply-to',
    'repost-of',
    'like-of',
    'bookmark-of',
    'tag-of',
    'category',
    'photo',
    'video',
    'audio',
  ],
  card: [
    'url',
    'email',
    'tel',
    'photo',
    'logo',
    'adr',
    'org',
  ],
};

/**
 * Derives a JF2 object from a Microformats2 object
 *
 * @param {Object} mf2 - The Microformats2 object
 * @param {Object} [options] - The options object
 * @param {String|Boolean} [options.preferredContentType='text/html'] -
 * Only return the preferred content type. Valid options are `'text/html'`,
 * `'text/plain'`. Optionally pass `false` to return all content types.
 * Defaults to `text/html`.
 * @param {String|Boolean} [options.implicitContentType='text/plain'] -
 * Implicit content type for content properties. Valid options are
 * `'text/plain'`, `'text/html'`. Optionally pass `false` to always include
 * the `content-type` property (recommended). Defaults to `text/plain`.
 * @param {Boolean|Object} [options.compact=true] - Collapse single element
 * arrays. If `false`, an (opinionated) list of excluded properties will not
 * be collapsed. Default is `true`. Optionally pass lists of properties to
 * exclude keyed by item type.
 * @param {Boolean|String} [options.references=true] - Include reference
 * items. If `false`, drops the references property. Optionally pass
 * `'embed'` to embed references inside JF2 properties. Default is `true`.
 * @returns {Object} - The JF2 object
 */
module.exports = function toJf2(mf2, options) {
  var jf2 = {};
  var items = _.cloneDeep(_.get(mf2, 'items'));

  options = options || {};
  options.preferredContentType = options.preferredContentType || 'text/html';
  if (options.implicitContentType !== false) {
    options.implicitContentType = options.implicitContentType || 'text/plain';
  }
  options.compact = options.compact || (options.compact !== false) || false;
  options.references = (options.references !== false);

  // Single item MF2
  if (!items || !items.length) { items = [mf2]; }

  // Initialize references
  jf2.references = {};

  // Parse items
  jf2.children = items.map(function(item) {
    return parseItem(item);
  });

  jf2.children = _.compact(jf2.children);

  // Process child items
  jf2.children.forEach(function(item) {
    processContent(item);

    // Compact single-value arrays
    if (options.compact) {
      compact(item);
    }
  });

  // Process reference items
  Object.keys(jf2.references).forEach(function(url) {
    var ref = jf2.references[url];

    processContent(ref);

    // Compact single-value arrays
    if (options.compact) {
      compact(ref);
    }
  });

  // References
  if (!options.references) {
    delete jf2.references;
  }

  if (options.references === 'embed') {
    jf2EmbedRefs(jf2);
  }

  // Collapse root collection on single item
  if (jf2.children.length === 1) {
    _.assign(jf2, jf2.children[0]);
    delete jf2.children;
  }

  return jf2;


  /**
   * @private
   * @param {Object} item - The MF2 item
   */
  function parseItem(item) {
    var result = {
      type: _.get(item, 'type[0]'),
    };

    if (!result.type) { return; }

    result.type = result.type.split('-')[1];

    _.assign(result, parseProperties(item.properties));

    return result;
  }

  /**
   * @private
   */
  function parseProperties(properties) {
    var result = {};

    // Remove empty properties
    properties = _.omitBy(properties, _.isEmpty);

    for (var key in properties) {
      // Handle content types
      if (key === 'content') {
        var content = [];
        var value = properties.content[0];

        if (value.html) {
          content.push({
            'content-type': 'text/html',
            value: value.html,
          });
        }

        if (value.value) {
          content.push({
            'content-type': 'text/plain',
            value: value.value,
          });
        }

        result.content = content;
        continue;
      }

      var values = properties[key];

      if (!Array.isArray(values)) {
        values = [values];
      }

      values = values.map(function(value) {
        // Handle nested items
        if (value.properties) {
          var item = parseItem(value);

          var id = (item.uid || item.url)[0];
          if (id) {
            jf2.references[id] = item;

            return id;
          }
        }

        return value;
      });

      result[key] = values;
    }

    return result;
  }


  /**
   * @private
   */
  function processContent(item) {
    if (!item.content) { return; }

    // Only return the preferred content-type
    if (options.preferredContentType) {
      // ... but only if more than one exists
      if (item.content.length > 1) {
        // ... and the configured content-type is found
        var preferred = _.find(item.content, {
          'content-type': options.preferredContentType,
        });

        if (preferred) {
          item.content = [preferred];
        }
      }
    }

    // Return a string if content-type is implicit
    if (options.implicitContentType) {
      // ... but only if only one exists
      if (item.content.length === 1) {
        // ... that has the configured content-type
        if (item.content[0]['content-type']
            === options.implicitContentType) {
          item.content = [item.content[0].value];
        }
      }
    }
  }


  /**
   * Collapses single-item arrays on jf2 properties
   *
   * This function mutates the jf2 object
   *
   * @private
   * @param {Object} item - The JF2 object
   */
  function compact(item) {
    var excluded =
        _.get(options, 'compact.' + jf2.type)
        || compactExclude[jf2.type]
        || [];

    for (var key in item) {
      var values = item[key];

      if (!Array.isArray(values)) { continue; }

      // Key is excluded from compact
      if (excluded.indexOf(key) !== -1) {
        continue;
      }

      if (values.length === 1) {
        item[key] = values[0];
      }
    }
  }

};
