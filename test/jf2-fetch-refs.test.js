/* global describe, it */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var nock = require('nock');

var jf2FetchRefs = require('../lib/jf2-fetch-refs');

var mockTargetNoteUrl = 'https://example.com/notes';

describe('@rcarls/indieutil.jf2FetchRefs', function() {

  describe('Fetching an in-reply-to reference', function() {
    
    var reply = {
      type: 'entry',
      'in-reply-to': 'https://example.com/notes/1',
      name: 'Test Reply',
      url: 'https://example.com/notes/2',
      content: 'lorem ipsum',
      published: '2015-10-21T12:00:00-0700',
    };

    var result, error;

    before('mock the target note response', function() {
      nock(mockTargetNoteUrl)
        .get('/1')
        .replyWithFile(200, __dirname + '/mocks/test-note.html');
    });

    before('fetch references', function(done) {
      jf2FetchRefs(reply)
        .then(function(jf2) {
          result = jf2;
          
          done();
        })
        .catch(function(err) {
          error = err;
          
          done();
        });
    });

    it('should not throw', function() {
      expect(error).to.not.be.ok;
    });
    
    it('should fetch the target note html', function() {
      expect(nock.isDone()).to.be.true;
    });

    it('should contain a references object', function() {
      expect(result.references).to.be.an('object');
    });

    it('should have the reply URL as reference key', function() {
      expect(result.references).to.have.property(mockTargetNoteUrl + '/1');
    });

    it('should contain the complete reference', function() {
      var ref = result.references[mockTargetNoteUrl + '/1'];
      
      expect(ref.type).to.equal('cite');
      expect(ref.name).to.equal('Test Note');
      expect(ref.content).to.deep.equal({
        'content-type': 'text/html',
        value: 'lorem ipsum',
      });
      expect(ref.url).to.equal(mockTargetNoteUrl + '/1');
    });

    it('should contain a properly formatted accessed date', function() {
      var ref = result.references[mockTargetNoteUrl + '/1'];
      
      expect(ref.accessed).to.match(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/
      );
    });
    
  }); // A reply note
  
});
