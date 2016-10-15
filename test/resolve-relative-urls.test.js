/* global: describe, it, before */

var chai = require('chai');
var expect = chai.expect;

var resolveRelativeUrls = require('../lib/resolve-relative-urls');

var mockSourceUrl = 'https://example.com';

describe('@rcarls/indieutil.resolveRelativeUrls', function() {

  describe('parsing an MF2 note with relative author URLs', function() {

    var note = {
      type: ['h-entry'],
      properties: {
        author: [{
          type: ['h-card'],
          properties: {
            photo: ['/images/author.jpg'],
            url: ['/'],
            name: ['Test Author'],
          },
        }],
        content: [{
          value: 'plain content',
        }],
        photo: [
          '/images/photo-1.jpg',
          '/images/photo-2.jpg',
        ],
      },
    };

    var result, authorPhoto, authorUrl, photos;

    before('parse the note', function() {
      result = resolveRelativeUrls(note, mockSourceUrl);
      authorPhoto = result.properties.author[0].properties.photo[0];
      authorUrl = result.properties.author[0].properties.url[0];
      photos = result.properties.photo;
    });

    it('should resolve relative URLs', function() {
      expect(authorPhoto).to.equal(mockSourceUrl + '/images/author.jpg');
      expect(authorUrl).to.equal(mockSourceUrl + '/');
      expect(photos[0]).to.equal(mockSourceUrl + '/images/photo-1.jpg');
      expect(photos[1]).to.equal(mockSourceUrl + '/images/photo-2.jpg');
    });

  }); // parsing an MF2 note with relative author URLs

}); // @rcarls/indieutil.resolveRelativeUrls
