var htmlparser2 = require('htmlparser2');

/**
 * Given an HTML string, returns the text content
 * 
 * Useful for comparing an h-entry p-name and HTML e-content.
 * 
 * @param {String} html - The HTML string to parse
 * @returns {String} - The text content of the HTML
 */
module.exports = function htmlToPlain(html) {
  if (!html) { return ''; }
  
  var content = '';
  
  var parser = new htmlparser2.Parser({
    ontext: function(text) {
      content += text;
    },
  }, { decodeEntities: true, });

  parser.write(html);
  parser.end();

  return content;
};
