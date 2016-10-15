var _ = require('lodash');
var isValidUrl = require('valid-url').isUri;
var request = require('request');
var Microformats = require('microformat-node');
var Q = require('q');

var toJf2 = require('./to-jf2');
var resolveRelativeUrls = require('./resolve-relative-urls');

/**
 * Fetches a URL and returns structured data
 *
 * @param {String} url - The URL to fetch
 * @param {Object} [options] - The options object
 * @param {Boolean|Object} [options.jf2=false] - If `true`, returns JF2
 * instead of MF2. Default is `false`. Optionally pass an options object for
 * toJf2.
 * @param {Number} [options.maxredirects=5] - Limit on redirects to follow
 * @param {String} [options.filter] - Limit items returned to type
 * @param {Boolean} [options.resolveRelativeUrls=true] - If `true`, will
 * replace relative URLs with absolute URLs. Default is `true`.
 * @param {fetchCallback} callback - The fetch callback
 * @returns {Promise<Error,Object>} - Promise for the parsed data
 */
module.exports = function(url, options, callback) {

  /**
   * @callback fetchCallback
   * @param {Error|null} err - The Error object
   * @param {Object} entry - The parsed data
   */

  options = options || {};

  options.maxRedirects = options.maxRedirects || 5;
  options.jf2 = options.jf2 || !!options.jf2;
  options.resolveRelativeUrls = (options.resolveRelativeUrls !== false);
  options.xssFilter = (options.xssFilter !== false);

  if (options.jf2 === true) {
    options.jf2 = {};
  }

  return Q.resolve(url)
    .then(function(url) {
      if (!isValidUrl(url)) {
        throw new TypeError('`url` must be a valid URI');
      }

      return Q.ninvoke(request, 'get', url, {
        maxRedirects: options.maxRedirects,
      })
        .spread(function(response, body) {
          if (response.statusCode !== 200) {
            throw new Error(
              url + ' returned status code ' + response.statusCode
            );
          }

          if (!body) {
            throw new Error('URL did not return a body');
          }

          var mfOpts = { html: body, };
          if (options.filter) { mfOpts.fitler = options.filter; }

          return Microformats.getAsync(mfOpts);
        })
        .then(function(data) {
          // TODO: Workaround for filter not working?
          if (options.filter) {
            data.items = _.filter(data.items, function(item) {
              return options.filter.indexOf(item.type[0]) !== -1;
            });
          }

          if (options.resolveRelativeUrls) {
            data = resolveRelativeUrls(data, url);
          }

          if (options.jf2) {
            return toJf2(data, options.jf2);
          } else {
            return data;
          }
        });
    })
    .nodeify(callback);
};
