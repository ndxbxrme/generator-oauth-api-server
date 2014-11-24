'use strict';
var fs = require('fs');

module.exports = {
  rewriteFile:function(filename, hook, splice, checkFor) {
    var text = fs.readFileSync(filename);
    if(!checkFor || !text.match(checkFor)) {
      text = text.toString().replace(hook, splice);
      fs.writeFileSync(filename, text);
    }
  } 
}