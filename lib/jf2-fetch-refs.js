var _ = require('lodash');
var Q = require('q');
var moment = require('moment');

var fetch = require('./fetch');
var entryToCite = require('./entry-to-cite');
var toJf2 = require('./to-jf2');
var determinePostTypes = require('./determine-post-types');

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
 * Fetch references for a JF2 note
 *
 * @param {Object} jf2 - The JF2 object
 * @param {Object} [options] - The options object
 * @param {Function} [options.cacheGet] - Optional cache get hook
 * @param {Function} [options.cachePut] - Optional cache put hook
 * @param {Boolean} [options.setAccessed=true] - If `true`, will set the
 * `accessed` property for each fetched reference. Default is `true`.
 * @param {Boolean} [options.determinePostTypes=false] - If `true`, will
 * set a `postTypes` property for each reference. Default is `false`.
 * @param {fetchReferencesCallback} callback - The fetchReferences callback
 * @returns {Promise<Error,Object> - Promise for the populated JF2
 */
module.exports = function jf2FetchRefs(jf2, options, callback) {

  /**
   * @callback fetchReferencesCallback
   * @param {Error|null} err - The Error object
   * @param {Object|null} jf2 - The JF2 object with populated references
   */

  options = options || {};
  options.cacheGet = options.cacheGet || function() {};
  options.cachePut = options.cachePut || function() {};
  options.setAccessed = (options.setAccessed !== false);
  options.determinePostTypes = !!options.determinePostTypes;

  var propTasks = embeddedProperties
      .map(function(prop) {
        // Get all URLs in each target property
        var urls = jf2[prop];

        if (!Array.isArray(urls)) { urls = [urls]; }

        // TODO: Handle other items like h-card

        var fetchTasks = urls.map(function(url) {
          // TODO: Handle embedded items

          // Allow fetching from a cache first
          return Q(options.cacheGet(url))
            .then(function(data) {
              if (!data) {
                return fetch(url, { filter: ['h-entry'], })
                  .then(function(mf2) {
                    data = entryToCite(mf2.items[0], { jf2: true, });

                    // Remove any embedded references
                    // TODO: Allow configurable level of recursion?
                    delete data.references;

                    // Set URL if not parsed
                    data.url = data.url || url;

                    // Set accessed
                    if (options.setAccessed) {
                      // TODO: Allow custom TZ
                      data.accessed = moment
                        .unix(new Date().getTime())
                        .toISOString();
                    }

                    // Set post types
                    if (options.determinePostTypes) {
                      data.postTypes = determinePostTypes(mf2.items[0]);
                    }

                    // Allow storing result in cache
                    options.cachePut(url, data);

                    return data;
                  });
              }

              return data;
            });

        });

        return Q.allSettled(fetchTasks);
      });

  return Q.all(propTasks)
    .then(function(tasks) {
      // Ignore failed fetches
      return _.filter(tasks, { state: 'fulfilled', })
        .map(function(task) {
          return task.value;
        });
    })
    .then(function(refs) {
      jf2.references = jf2.references || {};
      _.assign(jf2.references, refs);

      return jf2;
    }).nodeify(callback);

};
