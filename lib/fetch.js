var _ = require('lodash');
var isValidUrl = require('valid-url').isUri;
var request = require('request');
var Microformats = require('microformat-node');
var Q = require('q');

/**
 * Fetches a URL and returns structured data
 * 
 * @param {String} url - The URL to fetch
 * @param {Object} [options] - The options object
 * @param {Number} [options.maxredirects=5] - Limit on redirects to follow
 * @param {String} [options.filter] - Limit items returned to type
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
  options.jf2 = !!options.jf2;
  
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
          
          return data;
        });
    })
    .nodeify(callback);
};
