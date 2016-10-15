/* global describe, it, before */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var toJf2 = require('../lib/to-jf2');
var jf2EmbedRefs = require('../lib/jf2-embed-refs');

describe('@rcarls/indieutil.jf2EmbedRefs', function() {

  // Microformats2 data from the JF2 spec (Example 12)
  describe('Parsed JF2 of "Example 12" from the spec', function() {
    
    var source = require('./mocks/example12.json');
    var jf2 = toJf2(source);

    describe('embedding references', function() {

      before('embed the references', function() {
        jf2EmbedRefs(jf2);
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
      
    }); // embedding references

  }); // "Example 12" from the spec

}); // @rcarls/indieutil.jf2EmbedRefs
