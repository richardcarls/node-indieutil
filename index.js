var _ = require('lodash');

module.exports.toJf2 = function(mf2) {
  var jf2 = {};
  var items = _.get(mf2, 'items');

  // Single item MF2
  if (!items || !items.length) { items = [mf2]; }

  // Parse items
  jf2.children = items.map(function(item) {
    return parseItem(item);
  });

  jf2.children = _.compact(jf2.children);

  // Collapse root collection on single item
  if (jf2.children.length === 1) {
    jf2 = jf2.children[0];
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
        // Parse nested items
        if (value.properties) {
          var item = parseItem(value);

          if (item.url) {
            jf2.references = jf2.references || {};
            jf2.references[item.url] = item;

            return item.url;
          }

          return item;
        }

        // Handle content types
        var content;
        if (value.html) {
          content = content || [];
          content.push({
            'content-type': 'text/html',
            value: value.html,
          });
        }

        if (value.value) {
          content = content || [];
          content.push({
            'content-type': 'text/plain',
            value: value.value,
          });
        }
        if (content) {
          if (content.length === 1) { content = content[0]; }

          value = content;
        }

        return value;
      });

      // Collapse single array values
      if (values.length === 1) {
        result[key] = values[0];
      } else {
        result[key] = values;
      }
    }

    return result;
  }

};


/**
 * Formats an h-entry to an h-cite
 * 
 * Useful for saving responses from a webmention.
 * 
 * @param {Object} entry - The Microformats2 parsed entry
 * @returns {Object} - The entry formatted as an h-cite
 */
module.exports.entryToCite = function(entry) {
  return {
    type: ['h-cite'],
    properties: _.pick(entry.properties, [
      'name', 'url', 'uid', 'author', 'content', 'published', 'accessed', 'publication',
    ]),
  };
};
