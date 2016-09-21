/* global: describe, it, beforeEach */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var determinePostTypes = require('../lib/determine-post-types');

var mockNoteUrl = 'https://example.com/notes/1';

describe('@rcarls/indieutil.determinePostTypes', function() {

  describe('an entry', function() {

    var entry;

    beforeEach('basic entry', function() {
      entry = {
        type: ['h-entry'],
        properties: {
          content: { value: 'note', },
        },
      };
    });

    it('is a note', function() {
      expect(determinePostTypes(entry))
        .to.deep.equal(['note']);
    });

    it('is a note if name === content', function() {
      entry.properties.name = ['note'];

      expect(determinePostTypes(entry))
        .to.deep.equal(['note']);
    });

    it('is an article if name !== content', function() {
      entry.properties.name = ['Note Title'];

      expect(determinePostTypes(entry))
        .to.deep.equal(['article', 'note']);
    });

    it('is a tag if tag-of', function() {
      entry.properties['tag-of'] = [mockNoteUrl];

      expect(determinePostTypes(entry))
        .to.deep.equal(['tag', 'note']);
    });

    it('is a bookmark if bookmark-of', function() {
      delete entry.properties.content;
      entry.properties['bookmark-of'] = [mockNoteUrl];

      expect(determinePostTypes(entry))
        .to.deep.equal(['bookmark', 'note']);
    });

    it('is a repost if repost-of', function() {
      entry.properties['repost-of'] = [mockNoteUrl];

      expect(determinePostTypes(entry))
        .to.deep.equal(['repost', 'note']);
    });

    it('is a like if like-of', function() {
      delete entry.properties.content;
      entry.properties['like-of'] = [mockNoteUrl];

      expect(determinePostTypes(entry))
        .to.deep.equal(['like', 'note']);
    });

    it('is a reply if in-reply-to', function() {
      entry.properties['in-reply-to'] = [mockNoteUrl];

      expect(determinePostTypes(entry))
        .to.deep.equal(['reply', 'note']);
    });

    it('is an rsvp if both in-reply-to + rsvp', function() {
      delete entry.properties.content;
      entry.properties['in-reply-to'] = [mockNoteUrl];
      entry.properties.rsvp = ['yes'];

      expect(determinePostTypes(entry))
        .to.deep.equal(['rsvp', 'note']);
    });

  }); // an entry

  describe('an entry with html content and summary name', function() {

    var entry;

    beforeEach('html entry', function() {
      entry = {
        type: ['h-entry'],
        properties: {
          name: ['This is a note'],
          content: {
            html: '<span class="p-name">This is a note</span>\n    , <b>OK</b>?',
          },
        },
      };
    });

    it('is a note', function() {
      expect(determinePostTypes(entry))
        .to.deep.equal(['note']);
    });

  }); // an entry with html content and summary name

  describe('an entry with html content and intrinsic name', function() {

    var entry;

    beforeEach('html entry', function() {
      entry = {
        type: ['h-entry'],
        properties: {
          name: ['\n    I read <a href="' + mockNoteUrl + '">this</a>'
            + '\n    This is a <b>note</b>'],
          content: {
            html: 'This is a <b>note</b>',
          },
        },
      };
    });

    it('is a note', function() {
      expect(determinePostTypes(entry))
        .to.deep.equal(['note']);
    });

  }); // an entry with html content and intrinsic name

}); // @rcarls/indieutil.determinePostTypes
