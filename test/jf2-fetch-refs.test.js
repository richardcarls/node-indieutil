/* global describe, it */

var chai = require('chai');
var expect = chai.expect;

var nock = require('nock');

var jf2FetchRefs = require('../lib/jf2-fetch-refs');

var mockTargetNoteUrl = 'https://example.com/notes';

describe('@rcarls/indieutil.jf2FetchRefs', function() {

  describe('A simple reply note', function() {
    
    var reply = {
      type: 'entry',
      'in-reply-to': mockTargetNoteUrl + '/1',
      name: 'Test Reply',
      url: mockTargetNoteUrl + '/2',
      content: 'lorem ipsum',
      published: '2015-10-21T12:00:00-0700',
    };

    describe('fetching with default options', function() {

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

    }); // fetching with default options

    describe('fetching and embedding references', function() {

      var result;

      before('mock the target note response', function() {
        nock(mockTargetNoteUrl)
          .get('/1')
          .replyWithFile(200, __dirname + '/mocks/test-note.html');
      });
      
      before('fetch references', function(done) {
        jf2FetchRefs(reply, {
          embedReferences: true,
        })
          .then(function(jf2) {
            result = jf2;
            
            done();
          });
      });
      
      it('should not contain a references property', function() {
        expect(result.references).to.not.be.ok;
      });

      it('should replace the URL with an embedded item', function() {
        expect(result['in-reply-to'].type).to.equal('cite');
        expect(result['in-reply-to'].name).to.equal('Test Note');
        expect(result['in-reply-to'].content).to.deep.equal({
          'content-type': 'text/html',
          value: 'lorem ipsum',
        });
        expect(result['in-reply-to'].url)
          .to.equal(mockTargetNoteUrl + '/1');
      });

    }); // fetching and embedding references
    
  }); // a simply reply note

  describe('A note with multiple different response targets', function() {

    var multiReply = {
      type: 'entry',
      'in-reply-to': [
        mockTargetNoteUrl + '/1',
        mockTargetNoteUrl + '/2',
        mockTargetNoteUrl + '/3',
      ],
      'like-of': [
        mockTargetNoteUrl + '/4',
        mockTargetNoteUrl + '/5',
      ],
      'bookmark-of': mockTargetNoteUrl + '/6',
      name: 'Test Multi-Reply',
      url: mockTargetNoteUrl + '/test',
      content: 'lorem ipsum',
      published: '2015-10-21T12:00:00-0700',
    };

    var result, error;

    before('mock the target note responses', function() {
      nock(mockTargetNoteUrl)
        .get('/1')
        .replyWithFile(200, __dirname + '/mocks/test-note.html')
        .get('/2')
        .delay(300)
        .replyWithFile(200, __dirname + '/mocks/test-note.html')
        .get('/3')
        .reply(404)
        .get('/4')
        .replyWithFile(200, __dirname + '/mocks/test-note.html')
        .get('/5')
        .reply(200, 'Not html')
        .get('/6')
        .replyWithFile(200, __dirname + '/mocks/test-note.html')
    });

    before('fetch references', function(done) {
      jf2FetchRefs(multiReply)
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
    
    it('should fetch the target URLs', function() {
      expect(nock.isDone()).to.be.true;
    });

    it('should have all valid references only', function() {
      expect(result.references).to.have.keys([
        mockTargetNoteUrl + '/1',
        mockTargetNoteUrl + '/2',
        mockTargetNoteUrl + '/4',
        mockTargetNoteUrl + '/6',
      ]);
    });

    it('should preserve target properties', function() {
      expect(result['in-reply-to']).to.deep.equal([
        mockTargetNoteUrl + '/1',
        mockTargetNoteUrl + '/2',
        mockTargetNoteUrl + '/3',
      ]);
    });
    
  }); // A note with multiple different response targets
  
});
