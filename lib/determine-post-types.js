var _ = require('lodash');

var toJf2 = require('./to-jf2');
var htmlToPlain = require('./html-to-plain');

/**
 * Given an h-entry as MF2 or JF2, determines an ordered list of post types.
 *
 * @param {Object} entry - The h-entry object
 * @return (String[]} - List of post types, ordered by intent
 */
module.exports = function(entry) {
  var jf2;

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

  var types = [];

  if (jf2['in-reply-to']) {
    if (jf2.rsvp) { types.push('rsvp'); }
    if (jf2.content) { types.push('reply'); }
  }

  if (jf2['like-of']) { types.push('like'); }
  if (jf2['repost-of']) {  types.push('repost'); }
  if (jf2['bookmark-of']) { types.push('bookmark'); }
  if (jf2['tag-of']) { types.push('tag'); }

  if (jf2.name) {
    var content;

    if (jf2.content['content-type'] === 'text/html') {
      content = htmlToPlain(jf2.content.value);
    } else {
      content = jf2.content.value;
    }

    // If name isn't a prefix of or equal to content
    if (content.substring(0, jf2.name.length) !== jf2.name) {
      // If name contains consecutive whiespace chars,
      // then it probably isn't explicit
      if (jf2.name.search(/[\s]{3,}/) === -1) {
        types.push('article');
      }
    }
  }
  if (jf2.photo) { types.push('photo'); }

  // Everything's a note, man
  types.push('note');

  return types;
};
