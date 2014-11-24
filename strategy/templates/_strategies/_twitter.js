//ROUTES
  //TWITTER
  app.get('/api/twitter', passport.authenticate('twitter', {scope:'email'}));
  
  app.get('/api/twitter/callback', passport.authenticate('twitter', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  app.get('/api/connect/twitter', passport.authorize('twitter', {scope:'email'}));
  app.get('/api/unlink/twitter', function(req, res) {
    var user = req.user;
    user.twitter.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });
//END:ROUTES

//REQUIRE
    TwitterStrategy = require('passport-twitter').Strategy
//END:REQUIRE

//PASSPORT
  //TWITTER
  passport.use(new TwitterStrategy({
    consumerKey: process.env.TWITTER_KEY,
    consumerSecret: process.env.TWITTER_SECRET,
    callbackURL: process.env.TWITTER_CALLBACK,
    passReqToCallback: true
  }, function(req, token, tokenSecret, profile, done){
    process.nextTick(function(){
      if(!req.user) {
        User.findOne({ 'twitter.id': profile.id}, function(err, user) {
          if(err) {
            return done(err);
          }
          if(user) {
            if(!user.twitter.token) {
              user.twitter.token = token;
              user.twitter.username = profile.username;
              user.twitter.displayName = profile.displayName;
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
            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;
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
        user.twitter.id = profile.id;
        user.twitter.token = token;
        user.twitter.username = profile.username;
        user.twitter.displayName = profile.displayName;
        user.save(function(err) {
          if(err) {
            throw err; 
          }
          return done(null, user);
        });
      }
    });
  }));
//END:PASSPORT