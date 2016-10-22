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
    });
  } else {
    jf2 = entry;
  }

  var types = [];

  if (!_.isEmpty(jf2['in-reply-to'])) {
    if (jf2.rsvp) { types.push('rsvp'); }
    if (jf2.content) { types.push('reply'); }
  }

  if (!_.isEmpty(jf2['like-of'])) { types.push('like'); }
  if (!_.isEmpty(jf2['repost-of'])) {  types.push('repost'); }
  if (!_.isEmpty(jf2['bookmark-of'])) { types.push('bookmark'); }
  if (!_.isEmpty(jf2['tag-of'])) { types.push('tag'); }

  if (jf2.name) {
    var content;

    if (jf2.content['content-type'] === 'text/html') {
      content = htmlToPlain(jf2.content.value);
    } else {
      content = jf2.content.value;
    }

    // If name isn't a prefix of or equal to content
    if (content.substring(0, jf2.name.length) !== jf2.name) {
      // If name contains consecutive whitespace chars,
      // then it probably isn't explicit
      if (/[\s]{3,}/.test(jf2.name) === false) {
        types.push('article');
      }
    }
  }
  if (!_.isEmpty(jf2.photo)) { types.push('photo'); }

  // Everything's a note, man
  types.push('note');

  return types;
};
