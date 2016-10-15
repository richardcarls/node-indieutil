var _ = require('lodash');
var isValidUrl = require('valid-url').isUri;

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
 * Returns a list of mention target URLs for the entry
 * 
 * @param {Object} entry - The parsed entry object. Can be MF2 or JF2
 * @returns {String[]} - List of target URLs for webmentions
 */
module.exports = function determineMentionTargets(entry) {
  var jf2;

  if (!entry) { return []; }

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
  
  var mentions = targetProperties.reduce(function(mentions, prop) {
    var values = (entry[prop]);
    
    if (!values) { return mentions; }

    // Handle embedded items and invalid URLs
    var urls = values.map(function(value) {
      var url;
      
      if (value.url) {
        url = value.url;
      } else {
        url = value;
      }

      if (!isValidUrl(url)) {
        return null;
      }

      return url;
    });
    
    mentions = mentions.concat(urls);
    return mentions;
  }, []);
  
  mentions = _.uniq(_.compact(mentions));
  
  return mentions;
};
