/* global describe, it */

var chai = require('chai');
var expect = chai.expect;

var nock = require('nock');

var fetch = require('../lib/fetch');

var mockTargetNoteUrl = 'https://example.com';
var mockMf2 = require('./mocks/test-note-2.json');

describe('@rcarls/indieutil.fetch', function() {

  describe('Fetching a note', function() {

    describe('with default options', function() {

      var result, error;

      before('mock the GET request', function() {
        nock(mockTargetNoteUrl)
          .get('/notes/test')
          .replyWithFile(200, __dirname + '/mocks/test-note-2.html');
      });
      
      before('fetch references', function(done) {
        fetch(mockTargetNoteUrl + '/notes/test')
          .then(function(mf2) {
            result = mf2;
            
            done();
          })
          .catch(function(err) {
            error = err;
            
            done();
          });
      });

      it('should not throw', function() {
        expect(error).to.be.undefined;
      });
      
      it('should fetch the target note html', function() {
        expect(nock.isDone()).to.be.true;
      });

      it('should return the parsed MF2', function() {
        expect(result).to.deep.equal(mockMf2);
      });

    }); // with default options

  }); // Fetching a note

}); // @rcarls/indieutil.fetch
