'use strict';
var gzippo = require('gzippo');

module.exports = function(app) {
  app.use('/scripts', gzippo.staticGzip(__dirname + '/../dist/scripts'));
  app.use('/images', gzippo.staticGzip(__dirname + '/../dist/images'));
  app.use('/styles', gzippo.staticGzip(__dirname + '/../dist/styles'));
  app.use('/views', gzippo.staticGzip(__dirname + '/../dist/views'));
  app.use('/fonts', gzippo.staticGzip(__dirname + '/../dist/fonts'));
  app.use('/favicon', gzippo.staticGzip(__dirname + '/../dist/favicon'));
  app.all('/*', function(req, res) {
    res.sendFile('index.html', {root: __dirname + '/../dist'});
  });   
};