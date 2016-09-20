var _ = require('lodash');
var toJf2 = require('./to-jf2');

/**
 * Given a properties object, determines an ordered list of post types.
 *
 * @param {Object} entry - The h-entry object
 * @return (String[]} - List of post types, ordered by intent
 */
module.exports = function(entry) {
  var jf2 = toJf2(entry, {
    preferredContentType: 'text/plain',
    implicitContentType: true,
    compact: false,
    references: false,
  });

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
    // TODO: trim newlines, parse plain-text for comparison (new module)
    var content = jf2.content.value || jf2.content;

    // Only if name !== content
    if (jf2.name !== content) {
      types.push('article');
    }
  }
  if (jf2.photo) { types.push('photo'); }

  // Everything's a note, man
  types.push('note');

  return types;
};
