/* global describe, it */

var chai = require('chai');
var expect = chai.expect;

var nock = require('nock');

var jf2FetchRefs = require('../lib/jf2-fetch-refs');

var mockTargetNoteUrl = 'https://example.com';

describe('@rcarls/indieutil.jf2FetchRefs', function() {

  describe('A simple reply note', function() {
    
    var reply = {
      type: 'entry',
      'in-reply-to': mockTargetNoteUrl + '/notes/test',
      name: 'Test Reply',
      url: mockTargetNoteUrl + '/notes/reply',
      content: 'lorem ipsum',
      published: '2015-10-21T12:00:00-0700',
    };

    describe('fetching with default options', function() {

      var result, error;

      before('mock the target note response', function() {
        nock(mockTargetNoteUrl)
          .get('/notes/test')
          .replyWithFile(200, __dirname + '/mocks/test-note-2.html');
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

      it('should return the original object', function() {
        expect(result).to.have.property('type', 'entry');
        expect(result).to.have
          .property('in-reply-to', mockTargetNoteUrl + '/notes/test');
        expect(result).to.have.property('name', 'Test Reply');
        expect(result).to.have
          .property('url', mockTargetNoteUrl + '/notes/reply');
        expect(result).to.have.property('content', 'lorem ipsum');
        expect(result).to.have
          .property('published', '2015-10-21T12:00:00-0700');
      });

      it('should contain a references object', function() {
        expect(result.references).to.be.an('object');
      });

      it('should have the reply URL as reference key', function() {
        expect(result.references).to.have
          .property(mockTargetNoteUrl + '/notes/test');
      });

      it('should contain the complete reference', function() {
        var ref = result.references[mockTargetNoteUrl + '/notes/test'];
        
        expect(ref.type).to.equal('cite');
        expect(ref.content).to.deep.equal({
          'content-type': 'text/html',
          value: '\n        <p><strong>Lorem ipsum</strong> dolar sit amet.</p>\n\n        <p>End.</p>\n      ',
        });
        expect(ref.url).to.equal(mockTargetNoteUrl + '/notes/test');
      });

      it('should have the reply author URL as reference key', function() {
        expect(result.references).to.have
          .property('https://example.com/');
      });

      it('should contain the complete eauthor reference', function() {
        var ref = result.references['https://example.com/'];

        expect(ref.type).to.equal('card');
        expect(ref.photo).to.equal('https://example.com/images/author.jpg');
        expect(ref.name).to.equal('Test Author');
        expect(ref.url).to.equal('https://example.com/');
      });

    }); // fetching with default options
    
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
