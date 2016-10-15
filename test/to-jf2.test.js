/* global describe, it */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var toJf2 = require('../lib/to-jf2');

describe('@rcarls/indieutil.toJf2', function() {

  // Microformats2 data from the JF2 spec (Example 12)
  describe('"Example 12" from the spec', function() {
    
    var source = require('./mocks/example12.json');

    describe('parsed with default options', function() {
      
      var jf2 = toJf2(source)

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
      
    }); // parsed with default options

    describe('without references', function() {

      var jf2 = toJf2(source, {
        references: false,
      });

      it('should not include references property', function() {
        expect(jf2.references).to.not.be.ok;
      });

      it('should only have URL as author property', function() {
        expect(jf2.author).to.equal('http://example.com/');
      });
      
    });

    describe('with embedded references', function() {

      var jf2 = toJf2(source, {
        references: 'embed',
      });

      it('should not include references property', function() {
        //console.log(require('util').inspect(jf2, {depth:5}));
        expect(jf2.references).to.not.be.ok;
      });

      it('should have the embedded author card', function() {
        expect(jf2.author).to.deep.equal({
          type: 'card',
          name: 'A. Developer',
          url: 'http://example.com/',
        });
      });
      
    });

  }); // "Example 12" from the spec

  describe('"Example 2" from the spec', function() {

    var source = require('./mocks/example2.json');

    describe('parsed compact', function() {

      var jf2 = toJf2(source);

      it('should collapse single-value array properties', function() {
        expect(jf2.published).to.not.be.an('Array');
        expect(jf2.url).to.not.be.an('Array');
        expect(jf2.author).to.not.be.an('Array');
        expect(jf2['like-of']).to.not.be.an('Array');
      });

      it('should preserve array properties of length > 1', function() {
        expect(jf2.category).to.be.an('Array');
        expect(jf2.category).to.have.lengthOf(2);
      });
      
    }); // parsed compact

    describe('parsed non-compact', function() {

      var jf2 = toJf2(source, {
        compact: false,
      });

      it('should preserve arrays for multi-value properties', function() {
        expect(jf2['like-of']).to.be.an('Array');
        expect(jf2.category).to.be.an('Array');
      });

      it('should still collapse most properties', function() {
        expect(jf2.published).to.not.be.an('Array');
        expect(jf2.url).to.not.be.an('Array');
        expect(jf2.author).to.not.be.an('Array');
      });
      
    }); // parsed non-compact

    describe('parsed non-compact with custom config', function() {

      var jf2 = toJf2(source, {
        compact: {
          entry: [
            'url',
          ],
        },
      });

      it('should only preserve arrays on configured properties', function() {
        expect(jf2['like-of']).to.not.be.an('Array');
        expect(jf2.url).to.be.an('Array');
      });
      
    }); // parsed non-compact with custom config
    
  }); // "Example 2 from the spec
  
}); // @rcarls/indieutil.toJf2
