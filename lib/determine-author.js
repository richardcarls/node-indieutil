var _ = require('lodash');
var Q = require('q');
var isValidUrl = require('valid-url').isUri;

var fetch = require('./fetch');
var determineRepresentativeCard = require('./determine-representative-card');

/**
 * @typedef {Object} Result
 * @property {String} rel - Author URL from `rel=author`
 * @property {Object} entry - The h-entry of the parsed URL
 * @property {Object} value - The author data
 * @property {String} source - Source of the author data for debugging
 * @property {String[]} steps - Algorithm steps path for debugging
 */

/**
 * Given a URL, parses the target HTML for Microformats and applies the
 * authorship algorithm to determine the author and return author data.
 *
 * @param {String|Object} source - URL of page to parse.
 * @param {Object} [options] - The options object.
 * @param {Object} [options.data] - Pass pre-parsed MF2 data to avoid
 * fetching and reparsing.
 * @param {Boolean} [options.acceptEmbeddedCard=true] - If `false`, will
 * ignore an embedded h-card. Default is `true`.
 * @param {Boolean} [options.followAuthorUrl=true] - If `false`, will
 * not fetch and parse a discovered author URL. Default is `true`.
 * @param {determineAuthorCB} [callback] - The determineAuthor callback.
 *
 * @returns {Promise<Error,Result>} - Promise for the result object.
 */
module.exports = function determineAuthor(source, options, callback) {

  /**
   * @callback determineAuthorCB
   * @param {Error|null} err - The Error object.
   * @param {Result} result - The result object.
   */

  options = options || {};
  options.acceptEmbeddedCard = (options.acceptEmbeddedCard !== false);
  options.followAuthorUrl = (options.followAuthorUrl !== false);

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
      var authorData = {};

      // TODO: Handle multiple rel=author(?)
      authorData.rel = _.findKey(mfData['rel-urls'], { rels: ["author"], });

      // Step 1 & 2: Check for h-entry, grab the first one
      authorData.entry = _.find(mfData.items, { type: ['h-entry'], });
      authorData.steps = ['1'];

      if (authorData.entry) {
        authorData.steps.push('2');

        // Step 3: Check for explicit entry author property
        authorData.value = _.get(authorData.entry, 'properties.author');
        authorData.source = 'entry';
        authorData.steps.push('3');

        return authorData;
      } else {
        // Step 4: Check for feed with explicit author
        var feed = _.find(mfData.items, { type: ['h-feed'], });

        if (!feed) {
          throw new TypeError('No entry found on source.');
        }

        authorData.value = _.get(feed, 'properties.author');
        authorData.source = 'feed';
        authorData.steps.push('4');

        return authorData;
      }
    })
    .then(function(authorData) {
      var items = authorData.value;

      if (items) {
        // Step 5.1: Check for embedded h-card
        var card = _.find(authorData.value, { type: ['h-card'], });
        if (card) {
          authorData.value = _.cloneDeep(card);
          authorData.type = 'card';
          authorData.steps.push('5.1');

          return authorData;
        }

        // Step 5.2: Check for URL
        for (var i = 0, len = items.length; i < len; i++) {
          var url = items[i];

          if (isValidUrl(url)) {
            authorData.value = url;
            authorData.type = 'url';
            authorData.steps.push('5.2');

            return authorData;
          }
        }

        // Step 5.3: Use value as name
        authorData.value = items[0];
        authorData.type = 'string';
        authorData.steps.push('5.3');

        return authorData;
      } else {
        // Step 6: Use rel=author
        // TODO: Actual permalink verification? Existence of entry suffices here
        if (!authorData.entry || !authorData.rel) { return authorData; }

        authorData.value = authorData.rel;
        authorData.source = 'rel';
        authorData.type = 'url';
        authorData.steps.push('6');

        return authorData;
      }
    })
    .then(function(authorData) {
      if (authorData.type === 'string') {
        return authorData;
      }

      if (authorData.type === 'card') {
        // Return embedded h-card if found
        if (options.acceptEmbeddedCard) {
          authorData.steps.push('Accept embedded');
          return authorData;
        }

        var url = _.get(authorData.value, 'properties.url[0]');
        if (url) {
          authorData.value = url;
          authorData.source = 'entry';
          authorData.type = 'url';
        }
      }

      if (authorData.type === 'url') {
        if (!options.followAuthorUrl) {
          authorData.steps.push('Not fetching author page');
          return authorData;
        }

        // Step 7: Fetch author page
        authorData.steps.push('Fetching author page');
        return determineRepresentativeCard(authorData.value)
          .then(function(card) {
            authorData.steps.push('7');
            authorData.value = card;
            authorData.source += ' parsed';
            authorData.type = 'card';

            return authorData;
          });
      }

      // TODO: debug
      authorData.steps.push('Default return');
      return authorData;
    })
    .nodeify(callback);
};
