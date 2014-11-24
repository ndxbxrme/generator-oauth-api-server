//ROUTES
  //GOOGLE
  app.get('/api/google', passport.authenticate('google', {scope: ['profile', 'email']}));
  app.get('/api/google/callback', passport.authenticate('google', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  app.get('/api/connect/google', passport.authorize('google', {scope:['profile', 'email']}));
  app.get('/api/unlink/google', function(req, res){
    var user = req.user;
    user.google.token = undefined;
    user.save(function(err){
      res.redirect('/profile');
    });
  });
//END:ROUTES

//REQUIRE
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
//END:REQUIRE

//PASSPORT
  //GOOGLE
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_KEY,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK
  }, function(token, refreshToken, profile, done) {
    process.nextTick(function(){
      if(!req.user) {
        User.findOne({'google.id' : profile.id}, function(err, user) {
          if(err) {
            return done(err); 
          }
          if(user) {
            if(!user.google.token) {
              user.google.token = token;
              user.google.name = profile.displayName;
              user.google.email = profile.emails[0].value;
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
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value;
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
        user.google.id = profile.id;
        user.google.token = token;
        user.google.name = profile.displayName;
        user.google.email = profile.emails[0].value;
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