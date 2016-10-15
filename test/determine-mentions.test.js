/* global: describe, it, before */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var determineMentions = require('../lib/determine-mentions');

var mockNoteUrl = 'https://example.com/notes';

describe('@rcarls/indieutil.determineMentions', function() {

  describe('parsing a reply note', function() {

    var reply = {
      type: 'entry',
      'in-reply-to': mockNoteUrl + '/1',
      content: 'plain',
    };

    var result;

    before('parse the reply', function() {
      result = determineMentions(reply, mockNoteUrl + '/1');
    });

    it('should return an Array', function() {
      expect(result).to.be.an('Array');
    });

    it('should contain the target property', function() {
      expect(result[0]).to.equal('in-reply-to');
    });
    
  }); // parsing a reply note

  describe('parsing a multi-target response', function() {

    var reply = {
      type: 'entry',
      'in-reply-to': [
        mockNoteUrl + '/1',
        mockNoteUrl + '/2',
        mockNoteUrl + '/3',
      ],
      'repost-of': mockNoteUrl + '/1',
      'like-of': mockNoteUrl + '/1',
      'bookmark-of': mockNoteUrl + '/1',
      'tag-of': mockNoteUrl + '/1',
      content: 'test',
    };

    var result;

    before('parse the reply', function() {
      result = determineMentions(reply, mockNoteUrl + '/1');
    });

    it('should return all matching properties in order', function() {
      expect(result[0]).to.equal('in-reply-to');
      expect(result[1]).to.equal('repost-of');
      expect(result[2]).to.equal('like-of');
      expect(result[3]).to.equal('bookmark-of');
      expect(result[4]).to.equal('tag-of');
    });
    
  }); // parsing a multi-target response

  describe('parsing an MF2 entry', function() {

    var entry = {
      type: ['h-entry'],
      properties: {
        'in-reply-to': [ mockNoteUrl + '/1' ],
        content: [{
          value: 'test',
        }]
      },
    };

    var result;

    before('parse the reply', function() {
      result = determineMentions(entry, mockNoteUrl + '/1');
    });

    it('should return the target property', function() {
      expect(result[0]).to.equal('in-reply-to');
    });
    
  }); // parsing an MF2 entry
  
}); // @rcarls/indieutil.determineMentions
