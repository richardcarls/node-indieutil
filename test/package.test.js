/* global describe, it */

var expect = require('chai').expect;

var indieutil = require('..');

describe('@rcarls/indieutil', function() {

  it('should export functions', function() {
    expect(indieutil.toJf2).to.be.a('function');
    expect(indieutil.entryToCite).to.be.a('function');
    expect(indieutil.fetch).to.be.a('function');
  });
  
}); // @rcarls/indieutil
