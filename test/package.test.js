/* global describe, it */

var expect = require('chai').expect;

var indieutil = require('..');

describe('@rcarls/indieutil', function() {

  it('should export functions', function() {
    expect(indieutil.toJf2).to.be.a('function');
    expect(indieutil.entryToCite).to.be.a('function');
    expect(indieutil.fetch).to.be.a('function');
    expect(indieutil.jf2FetchRefs).to.be.a('function');
    expect(indieutil.jf2EmbedRefs).to.be.a('function');
    expect(indieutil.determineAuthor).to.be.a('function');
    expect(indieutil.determineRepresentativeCard).to.be.a('function');
    expect(indieutil.determineMentions).to.be.a('function');
    expect(indieutil.determinePostTypes).to.be.a('function');
    expect(indieutil.htmlToPlain).to.be.a('function');
  });
  
}); // @rcarls/indieutil
