'use strict';

module.exports = function(app, passport) {
  app.get('/api/user', isLoggedIn, function(req, res) {
    res.json(req.user);
  });
  
  //strategy-routes
  //end:strategy-routes
  
  app.get('/api/logout', function(req, res){
    req.logout();
    res.redirect('/api/user');
  });
  
  function isLoggedIn(req, res, next) {
    if(req.isAuthenticated()) {
      return next(); 
    }
    res.status(401).send(req.flash('loginMessage'));
  }
};