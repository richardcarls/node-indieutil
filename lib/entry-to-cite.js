var _ = require('lodash');

/**
 * Formats an h-entry to an h-cite
 * 
 * Useful for saving responses from a webmention.
 * 
 * @param {Object} entry - The Microformats2 parsed entry
 * @returns {Object} - The entry formatted as an h-cite
 */
module.exports = function(entry) { 
  return {
    type: ['h-cite'],
    properties: _.pick(entry.properties, [
      'name', 'url', 'uid', 'author', 'content', 'published', 'accessed', 'publication',
    ]),
  };
};
