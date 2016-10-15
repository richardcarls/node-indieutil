var _ = require('lodash');

var toJf2 = require('./to-jf2');

/**
 * List of target properties for different types of responses
 * 
 * @private
 */
var targetProperties = [
  'in-reply-to',
  'repost-of',
  'like-of',
  'bookmark-of',
  'tag-of',
];


/**
 * Returns a list of matched target properties in order of relevance
 * 
 * @param {Object} entry - The parsed entry object. Can be MF2 or JF2
 * @param {String} url - The URL to find matching properties for
 * @returns {String[]} - List of target properties matching `url`
 */
module.exports = function determineMentions(entry, url) {
  var jf2;

  if (!entry || !url) { return []; }

  if (Array.isArray(entry.type)) {
    jf2 = toJf2(entry, {
      preferredContentType: 'text/plain',
      implicitContentType: false,
      compact: false,
      references: false,
    });
  } else {
    jf2 = entry;
  }
  
  return targetProperties.reduce(function(matches, prop) {
    if (!jf2[prop]) { return matches; }
    
    if (jf2[prop].indexOf(url) === -1) {
      return matches;
    }

    matches.push(prop);
    return matches;
  }, []);
};
