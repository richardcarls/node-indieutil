var _ = require('lodash');

var toJf2 = require('./to-jf2');

/**
 * List of defined h-cite properties
 *
 * @private
 */
var citeProperties = [
  'name',
  'url',
  'uid',
  'author',
  'content',
  'published',
  'accessed',
  'publication',
];


/**
 * Formats an h-entry to an h-cite
 *
 * Useful for saving responses from a webmention or reply contexts.
 *
 * @param {Object} entry - The Microformats2 parsed entry
 * @param {Boolean|Object} [options.jf2=false] - If `true`, returns JF2
 * instead of MF2. Default is `false`. Can also pass the toJf2 options object.
 * @returns {Object} - The entry formatted as an h-cite
 */
module.exports = function entryToCite(entry, options) {
  options = options || {};
  if (options.jf2 === true) {
    options.jf2 = {};
  }
  options.jf2 = options.jf2 || false;

  var cite = {
    type: ['h-cite'],
    properties: _.pick(entry.properties, citeProperties),
  };

  if (options.jf2) {
    return toJf2(cite, options.jf2);
  }

  return cite;
};
