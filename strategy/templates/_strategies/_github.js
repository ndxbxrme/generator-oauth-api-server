//ROUTES
  //GITHUB
  app.get('/api/github', passport.authenticate('github', {scope:['user','user:email']}));
  
  app.get('/api/github/callback', passport.authenticate('github', {
    successRedirect: '/',
    failureRedirect: '/login'
  }));
  app.get('/api/connect/github', passport.authorize('github', {scope:['user','user:email']}));
  app.get('/api/unlink/github', function(req, res) {
    var user = req.user;
    user.github.token = undefined;
    user.save(function(err) {
      res.redirect('/profile');
    });
  });
//END:ROUTES

//REQUIRE
    GithubStrategy = require('passport-github').Strategy
//END:REQUIRE

//PASSPORT
  //GITHUB
  passport.use(new GithubStrategy({
    clientID: process.env.GITHUB_KEY,
    clientSecret: process.env.GITHUB_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK,
    passReqToCallback: true
  }, function(req, token, refreshToken, profile, done) {
    process.nextTick(function(){
      if(!req.user) {
        User.findOne({'github.id':profile.id}, function(err, user){
          if(err) {
            return done(err); 
          }
          if(user) {
            if(!user.github.token) {
              user.github.token = token;
              user.github.name = profile.displayName;
              user.github.email = profile.emails[0].value;
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
            newUser.github.id = profile.id;
            newUser.github.token = token;
            newUser.github.name = profile.displayName;
            newUser.github.email = profile.emails[0].value;
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
        user.github.id = profile.id;
        user.github.token = token;
        user.github.name = profile.displayName;
        user.github.email = profile.emails[0].value;
        user.save(function(err){
          if(err) {
            throw err; 
          }
          return done(null, err);
        });
      }
    }); 
  }));
//END:PASSPORT