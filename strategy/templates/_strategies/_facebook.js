//ROUTES
  //FACEBOOK
  app.get('/api/facebook', passport.authenticate('facebook', {scope:'email'}));
  
  app.get('/api/facebook/callback', passport.authenticate('facebook', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  app.get('/api/connect/facebook', passport.authorize('facebook', {scope:'email'}));
  app.get('/api/unlink/facebook', function(req, res) {
    var user = req.user;
    user.facebook.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });
//END:ROUTES

//REQUIRE
    FacebookStrategy = require('passport-facebook').Strategy
//END:REQUIRE

//PASSPORT
  //FACEBOOK
  passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_KEY,
    clientSecret: process.env.FACEBOOK_SECRET,
    callbackURL: process.env.FACEBOOK_CALLUP,
    passReqToCallback: true
  }, function(req, token, refreshToken, profile, done){
    process.nextTick(function(){
      if(!req.user) {
        User.findOne({'facebook.id': profile.id}, function(err, user){
          if(err) {
            return done(err); 
          }
          if(user) {
            if(!user.facebook.token) {
              user.facebook.token = token;
              user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
              user.facebook.email = profile.emails[0].value;
              user.save(function(err) {
                if(err) {
                  throw err; 
                }
                return done(null, user);
              });
            }
            return done(null, user); 
          }
          else {
            var newUser = new User();
            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
            newUser.facebook.email = profile.emails[0].value;
            newUser.save(function(err){
              if(err) {
                throw err; 
              }
              return done(null, newUser);
            });
          }
        });
      }
      else {
        var user = req.user;
        user.facebook.id = profile.id;
        user.facebook.token = token;
        user.facebook.name = profile.name.givenName + ' ' + profile.name.familyName;
        user.facebook.email = profile.emails[0].value;
        user.save(function(err){
          if(err) {
            throw err; 
          }
          return done(null, user);
        });
      }
    });
  }));
  
//END:PASSPORT