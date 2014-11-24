var User = require('../models/user');

module.exports = function(passport) {
  //strategies
  //end:strategies
  
  passport.serializeUser(function(user, done){
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });  
};