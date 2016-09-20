var _ = require('lodash');

var arrayProperties = [
  'in-reply-to',
  'repost-of',
  'like-of',
  'bookmark-of',
  'tag-of',
  'url',
  'category',
  'photo',
  'video',
  'audio',
];

/**
 * Derives a JF2 object from a Microformats2 object
 * 
 * @param {Object} mf2 - The Microformats2 object
 * @param {Object} [options] - The options object
 * @param {Boolean} [options.preferredContentType='text/html'] - Preferred content
 * type. Valid options are `'text/html'`, `'text/plain'`, `'all'`. Defaults to
 * `text/html`.
 * @param {Boolean} [options.implicitContentType='text/plain'] - Implicit content
 * type for single String properties. Valid options are `'text/plain'`,
 * `'text/html'`. Set `false` to always include `content-type` property. Defaults
 * to `text/plain`.
 * @param {Boolean} [options.compact=true] - Collapse single element arrays for
 * properties that can contain multiple values. Default is `true`.
 * @param {Boolean} [options.references=true] - Move embedded items to a
 * `references` property, if referenceable by uid/url. Default is `true`.
 * @returns {Object} - The JF2 object
 */
module.exports = function(mf2, options) {
  var jf2 = {};
  var items = _.cloneDeep(_.get(mf2, 'items'));

  options = options || {};
  options.preferredContentType = options.preferredContentType || 'text/html';
  if (options.implicitContentType !== false) {
    options.implicitContentType = options.implicitContentType || 'text/plain';
  }
  options.compact = (options.compact !== false);
  options.references = (options.references !== false);
  
  // Single item MF2
  if (!items || !items.length) { items = [mf2]; }

  // Parse items
  jf2.children = items.map(function(item) {
    return parseItem(item);
  });

  jf2.children = _.compact(jf2.children);

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

    properties = _.omitBy(properties, _.isEmpty);

    for (var key in properties) {
      var values = properties[key];

      if (!Array.isArray(values)) {
        values = [values];
      }

      values = values.map(function(value) {
        // Handle nested items
        if (value.properties) {
          var item = parseItem(value);

          if (options.references) {
            if (item.uid || item.url) {
              jf2.references = jf2.references || {};
              jf2.references[item.uid || item.url] = item;

              return item.uid || item.url;
            }
          }

          return item;
        }

        // Handle content types
        // TODO: Refactor, too complex/confusing!
        if (key === 'content') {
          var content = [];

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

          // Return an array of all content types if configured
          if (!options.preferredContentType || options.preferredContentType === 'all') {
            return content;
          }

          if (content.length > 1) {

            // Prefer text/plain
            if (options.preferredContentType === 'text/plain') {
              
              // Return just the text/plain content String
              if (options.implicitContentType === 'text/plain') {
                return content[1].value;
              }
              
              return content[1];
            }

            // Prefer text/html
            return content[0];
          } else if (content.length === 1) {
            // Return single content type found
            return content[0];
          } else {
            // Return value as implicit content type
            return '' + value;
          }
        }
        
        return value;
      });

      // Collapse single array values
      if (values.length === 1) {
        if (!options.compact && arrayProperties.indexOf(key) !== -1) {
          result[key] = values;
        } else {
          result[key] = values[0];
        }
      } else {
        result[key] = values;
      }
    }

    return result;
  }

};
