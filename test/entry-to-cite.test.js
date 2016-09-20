/* global describe, it */

var chai = require('chai');
chai.use(require('chai-things'));
var expect = chai.expect;

var entryToCite = require('../lib/entry-to-cite');

describe('@rcarls/indieauth.entryToCite', function() {

  describe('converting an entry', function() {

    var entry = require('./mocks/mf2-entry');
    var cite = entryToCite(entry);

    it('should be of type h-cite', function() {
      expect(cite.type).to.contain('h-cite');
    });

    it('should contain shared properties', function() {
      expect(cite.properties).to.have.property('name');
      expect(cite.properties).to.have.property('content');
      expect(cite.properties).to.have.property('url');
      expect(cite.properties).to.have.property('published');
    });

    it('should only contain cite properties', function() {
      expect(cite.properties).to.not.have.property('category');
    });

  }); // converting an entry

}); // @rcarls/indieauth.entryToCite
