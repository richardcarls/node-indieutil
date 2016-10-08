/**
 * h-entry properties that can have embedded items
 */
var embeddedProperties = [
  'in-reply-to',
  'like-of',
  'repost-of',
  'bookmark-of',
  'tag-of',
  'comment'
];


/**
 * Replace property urls with reference items
 * 
 * This function mutates `jf2`.
 * 
 * @param {Object} jf2 - The JF2 item with references
 * @return {Object} - the JF2 with embedded references
 */
module.exports = function jf2EmbedRefs(jf2) {
  if (!jf2 || !jf2.references) { return; }
  
  embeddedProperties.forEach(function(prop) {
    if (!jf2[prop]) { return; }

    var urls = jf2[prop];

    if (!Array.isArray(urls)) { urls = [urls]; }

    // Replace the value(s) from references property
    jf2[prop] = urls.map(function(url) {
      if (jf2.references[url]) {
        return jf2.references[url];
      }

      return url;
    });
  });

  delete jf2.references;
};
