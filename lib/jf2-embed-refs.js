var _ = require('lodash');

var embeddedProperties = {
  entry: [
    'in-reply-to',
    'like-of',
    'repost-of',
    'bookmark-of',
    'tag-of',
    'comment',
    'author',
  ],
  card: [],
  cite: [
    'author',
  ],
};


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

  // TODO: Handle multiple items [children]
  var props = embeddedProperties[jf2.type];
  if (!props) { return; }
  
  props.forEach(function(prop) {
    if (!jf2[prop]) { return; }

    // Handle string values
    if(!Array.isArray(jf2[prop])) {
      var ref = jf2.references['' + jf2[prop]];

      if (ref) {
        jf2[prop] = ref;
      }

      return;
    }

    // Handle array values
    var refs = [];
    jf2[prop].forEach(function(url) {
      if (jf2.references[url]) {
        refs.push(jf2.references[url]);
      } else {
        refs.push(url);
      }
    });

    jf2[prop] = refs;
  });

  delete jf2.references;
};
