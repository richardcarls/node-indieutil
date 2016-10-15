var _ = require('lodash');
var Q = require('q');
var moment = require('moment');

var fetch = require('./fetch');
var entryToCite = require('./entry-to-cite');
var toJf2 = require('./to-jf2');
var determinePostTypes = require('./determine-post-types');
var jf2EmbedRefs = require('./jf2-embed-refs');

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
 * @param {Object} [options.jf2] - toJf2 options for references
 * @param {Boolean} [options.embedReferences=false] - If `true`, will embed
 * references in the entry. Default is `false`.
 * @param {Boolean} [options.setAccessed=true] - If `true`, will set the
 * `accessed` property for each fetched reference. Default is `true`.
 * @param {Boolean} [options.determinePostTypes=false] - If `true`, will
 * set a `postTypes` property for each reference. Default is `false`.
 * @param {jf2FetchrefsCallback} callback - The jf2FetchRefs callback
 * @returns {Promise<Error,Object> - Promise for the populated JF2
 */
module.exports = function jf2FetchRefs(jf2, options, callback) {

  /**
   * @callback jf2FetchRefsCallback
   * @param {Error|null} err - The Error object
   * @param {Object|null} jf2 - The JF2 object with populated references
   */

  options = options || {};
  options.jf2 = options.jf2 || {};
  options.embedReferences = !!options.embedReferences;
  options.setAccessed = (options.setAccessed !== false);
  options.determinePostTypes = !!options.determinePostTypes;
  
  var fetchTasks;

  fetchTasks = embeddedProperties
    .reduce(function(tasks, prop) {
      if (!jf2[prop]) { return tasks; }

      // Handle string properties
      if (!Array.isArray(jf2[prop])) {
        var url = jf2[prop];
        
        tasks.push(doFetch(url));
        return tasks;
      }

      // Handle array properties
      jf2[prop].forEach(function(url) {
        tasks.push(doFetch(url));
      });

      return tasks;
    }, []);

  return Q.allSettled(fetchTasks)
    .then(function(tasks) {
      // Ignore failed fetches
      return _.filter(tasks, { state: 'fulfilled', })
        .map(function(task) {
          return task.value;
        });
    })
    .then(function(refs) {
      jf2.references = jf2.references || {};

      refs.forEach(function(ref) {
        _.assign(jf2.references, ref);
      });

      if (options.embedReferences) {
        jf2EmbedRefs(jf2);
      }

      return jf2;
    }).nodeify(callback);


  /**
   * @private
   */
  function doFetch(url) {
    return fetch(url, { filter: ['h-entry'], })
      .then(function(mf2) {
        var entry = mf2.items[0];
        var data = entryToCite(entry, { jf2: options.jf2, });
        var ref = {};

        // Remove any embedded references
        // TODO: Allow configurable level of recursion?
        delete data.references;

        // Set URL if not parsed
        data.url = data.url || url;

        // Set accessed
        if (options.setAccessed) {
          // TODO: Allow custom TZ
          data.accessed = moment(new Date().getTime())
            .toISOString();
        }

        // Set post types
        if (options.determinePostTypes) {
          data.postTypes = determinePostTypes(entry);
        }

        ref[url] = data;
        return ref;
      });
  }
  
};
