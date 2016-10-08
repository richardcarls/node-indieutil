/**
 * @module indieutil
 */
module.exports = {
  toJf2: require('./lib/to-jf2'),
  entryToCite: require('./lib/entry-to-cite'),
  fetch: require('./lib/fetch'),
  jf2FetchRefs: require('./lib/jf2-fetch-refs'),
  jf2EmbedRefs: require('./lib/jf2-embed-refs'),
  determineAuthor: require('./lib/determine-author'),
  determineRepresentativeCard: require('./lib/determine-representative-card'),
  determineMentions: require('./lib/determine-mentions'),
  determinePostTypes: require('./lib/determine-post-types'),
  htmlToPlain: require('./lib/html-to-plain'),
};
