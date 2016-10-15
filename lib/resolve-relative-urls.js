var url = require('url');
var _ = require('lodash');
var traverse = require('traverse');

var urlProperties = [
  'in-reply-to',
  'repost-of',
  'like-of',
  'bookmark-of',
  'tag-of',
  'uid',
  'url',
  'photo',
  'author',
];


module.exports = function resolveRelativeUrls(item, fqdn) {
  if (!item || !fqdn) { return item; }

  return traverse(item).forEach(function(values) {
    if (urlProperties.indexOf(this.key) !== -1) {
      if (!Array.isArray(values)) {
        values = [values];
      }

      values = values.map(function(value) {
        if (!value) { return value; }
        
        // Handle embedded items recursively
        if (value.type) {
          return resolveRelativeUrls(value, fqdn);
        }
        
        return url.resolve(fqdn, value);
      });

      this.update(values);
    }
  });
};
