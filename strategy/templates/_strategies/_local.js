//ROUTES
  //LOCAL
  app.post('/api/signup', passport.authenticate('local-signup', {
    successRedirect: '/api/user',
    failureRedirect: '/api/user',
    failureFlash: true
  }));
  app.post('/api/login', passport.authenticate('local-login', {
    successRedirect: '/api/user',
    failureRedirect: '/api/user',
    failureFlash: true
  }));
  app.post('/api/connect/local', passport.authorize('local-signup'));
  app.get('/api/unlink/local', function(req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function(err){
      res.redirect('/profile');
    });
  });
//END:ROUTES

//REQUIRE
    LocalStrategy = require('passport-local').Strategy
//END:REQUIRE

//PASSPORT
  //LOCAL
  passport.use('local-signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },function(req, email, password, done){
    process.nextTick(function(){
      User.findOne({'local.email': email}, function(err, user){
        if(err) {
          return done(err); 
        }
        if(user) {
          return done(null, false, req.flash('signupMessage', 'That email is already taken.')); 
        }
        else {
          var newUser = new User();
          newUser.local.email = email;
          newUser.local.password = newUser.generateHash(password);
          newUser.save(function(err){
            if(err) {
              throw err; 
            }
            return done(null, newUser);
          });
        }
      });
    }); 
  }));
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done){
    User.findOne({'local.email':email}, function(err, user){
      if(err) {
        return done(err); 
      }
      if(!user) {
        return done(null, false, req.flash('loginMessage', 'No user found')); 
      }
      if(!user.validPassword(password)) {
        return done(null, false, req.flash('loginMessage', 'Wrong password')); 
      }
      return done(null, user);
    });
  }));
//END:PASSPORT