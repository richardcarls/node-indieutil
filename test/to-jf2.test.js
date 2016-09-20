/* global describe, it */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var indieutil = require('..');

describe('indieutil.toJf2', function() {

  // Microformats2 data from the JF2 spec (Example 12)
  describe('The parsed JF2 of "Example 12" from the spec', function() {
    var source = require('./mocks/example12.json');
    
    var jf2 = indieutil.toJf2(source)

    it('should be type "entry"', function() {
      expect(jf2.type).to.equal('entry');
    });

    it('should include all singular properties', function() {
      expect(jf2).to.have.property('name', 'Hello World');
      expect(jf2).to.have.property('summary', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus imperdiet ultrices pulvinar.');
      expect(jf2).to.have.property('url', 'http://example.com/2015/10/21');
      expect(jf2).to.have.property('published', '2015-10-21T12:00:00-0700');
    });

    it('should correctly parse content', function() {
      expect(jf2.content).to.deep.equal({
          'content-type': 'text/html',
          value: '<p>Donec dapibus enim lacus, <i>a vehicula magna bibendum non</i>. Phasellus id lacinia felis, vitae pellentesque enim. Sed at quam dui. Suspendisse accumsan, est id pulvinar consequat, urna ex tincidunt enim, nec sodales lectus nulla et augue. Cras venenatis vehicula molestie. Donec sagittis elit orci, sit amet egestas ex pharetra in.</p>',
        });
    });

    it('should move non-authoritative author h-card to references', function() {
      expect(jf2.references).to.be.ok;
      expect(jf2.references).to.have.property('http://example.com/');
      expect(jf2.references['http://example.com/']).to.deep.equal({
        type: 'card',
        name: 'A. Developer',
        url: 'http://example.com/',
      });
    });

  }); // The parsed JF2 of "Example 12" from the spec
  
}); // indieutil.toJf2
