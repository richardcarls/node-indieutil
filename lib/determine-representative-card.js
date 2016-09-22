var _ = require('lodash');
var Q = require('q');
var isValidUrl = require('valid-url').isUri;

var fetch = require('./fetch');


/**
 * Given a URL, parses the HTML for Microformats and applies the
 * representative h-card algorithm to determine if there is one and
 * return it.
 *
 * @param {String|Object} source - URL of page to parse.
 * @param {Object} [options] - The options object.
 * @param {Object} [options.data] - Pass pre-parsed MF2 data to avoid
 * fetching and reparsing.
 * @param {determineRepresentativeCardCB} [callback] - The
 * determineRepresentativeCard callback.
 *
 * @returns {Promise<Error,Object>} - Promise for the representative h-card
 */
module.exports = function determineRepresentativeCard(source, options, callback) {

  /**
   * @callback determineRepresentativeCardCB
   * @param {Error|null} err - The Error object.
   * @param {Object} card - The representative h-card
   */

  options = options || {};

  return Q(source)
    .then(function(source) {
      // Step 0: Handle input to get full parsed MF2

      if (!source) {
        throw new TypeError('No source specified.');
      }

      // Handle URL and fetch structured data
      if (_.isString(source)) {
        if (!isValidUrl(source)) {
          throw new TypeError('Source is not a valid URL.');
        }

        return fetch(source);
      }

      // Handle MF2
      if (!_.get(options, 'data.items')) {
        throw new TypeError('No data or does not appear to be valid MF2.');
      }

      return options.data;
    })
    .then(function(mfData) {
      var cards = _.filter(mfData.items, { type: ['h-card'], });
      var rels = _.compact(
        _.toPairs(mfData['rel-urls'])
          .map(function(pair) {
            if (pair[1].rels.indexOf('me') !== -1) {
              return pair[0];
            }

            return null;
          })
      );

      if (!cards) { throw new Error('No h-card found.'); }

      var testResult;

      // Step 3: Check if only one card. (This should be step 1?)
      if (cards.length === 1) {
        testResult = (function(card) {
          var urls = _.get(card, 'properties.url');

          if (!urls) { return; }

          if (urls.indexOf(source) !== -1) {
            return card;
          }
        })(cards[0]);
      }

      if (!testResult) {
        return testResult;
      }

      // Step 1: Check if uid === url === source
      testResult = cards.reduce(function(result, card) {
        var uids = _.get(card, 'properties.uid');
        var urls = _.get(card, 'properties.url');

        if (!uids || !urls) { return result; }

        var uid;
        for (var i = 0; i < uids.length; i++) {
          uid = uids[i];

          if (urls.indexOf(uid) !== -1) {
            if (uid === source) {
              result.push(card);
              return result;
            }
          }
        }
      }, []);

      if (!_.isEmpty(testResult)) {
        return testResult[0];
      }

      // Step 2: Check if rel=me url === source
      testResult = cards.reduce(function(result, card) {
        var urls = _.get(card, 'properties.url');

        if (!urls) { return result; }

        var url;
        for (var i = 0; i < urls.length; i++) {
          url = urls[i];

          if (rels.indexOf(url) !== -1) {
            if (url === source) {
              result.push(card);
              return result;
            }
          }
        }
      }, []);

      if (!_.isEmpty(testResult)) {
        return testResult[0];
      }

      throw new Error('No Representative card found.');
    })
    .nodeify(callback);
};
