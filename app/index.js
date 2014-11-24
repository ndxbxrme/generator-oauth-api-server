'use strict';
var util = require('util'),
    path = require('path'),
    yeoman = require('yeoman-generator'),
    yosay = require('yosay'),
    fs = require('fs');

var OauthApiServerGenerator = yeoman.generators.Base.extend({
  initializing: function () {
    this.pkg = require('../package.json');
    this.allStrats = ['local','twitter','facebook','github','google'];
    
  },

  prompting: {
    greeting: function () {
      var done = this.async();

      // Have Yeoman greet the user.
      this.log(yosay(
        'Make a server!'
      ));
      if(!this.dest.exists('app/scripts/app.js')) {
        this.log('Please run yo angular first.');  
      }
      else {
        done();
      }
    },
    askForDBInfo: function() {
      var done = this.async();
      var prompts = [
        {
          type: 'input',
          name: 'dburl',
          message: 'What is your mongodb url?',
          default: 'mongodb://127.0.0.1:27017/DevDB'
        },
        {
          type: 'input',
          name: 'session',
          message: 'Enter some randomness for the session secret'
        }
      ];
      this.prompt(prompts, function(props) {
        this.dburl = props.dburl;
        this.session = props.session;
        done();
      }.bind(this));
    },
    askForStrategies: function() {
      var done = this.async();
      var prompts = [{
        type: 'checkbox',
        name: 'strategies',
        message: 'Which oauth strategies would you like to include?',
        choices: []
      }];
      this.allStrats.forEach(function(strat){
        prompts[0].choices.push({
          value: strat,
          name: strat,
          checked: true
        });
      });
      
      this.prompt(prompts, function(props) {
        this.strategies = props.strategies;
        done();
      }.bind(this));
    },
    askForEnableKeys: function() {
      var done = this.async();
      if(this.strategies.length>0 || (this.strategies.length===1 && this.strategies.indexOf('local')===-1)) {
        var prompts = [
          {
            type: 'confirm',
            name: 'enableKeys',
            message: 'Do you want to enter your keys/secrets now?',
            default: true
          }
        ];
        this.prompt(prompts, function(props) {
          this.enableKeys = props.enableKeys;
          done();
        }.bind(this));
      }
      else {
        done();
      }
    }
  },
  askForKeys: function() {
    var done = this.async();
    if(this.enableKeys) {
      var prompts = [];
      this.strategies.forEach(function(strat){
        if(strat!=='local') {
          prompts.push({
            type: 'input',
            name: strat + 'Key',
            message: this._.humanize(strat) + ' key'
          });
          prompts.push({
            type: 'input',
            name: strat + 'Secret',
            message: this._.humanize(strat) + ' secret'
          });
        }
      }.bind(this));
      this.prompt(prompts, function(props) {
        this.keys = props;
        done();
      }.bind(this));
    }
    else {
      done(); 
    }
  },


  writing: {
    app: function () {
      var context = {appName:'myApp'};
      function rewriteFile(filename, hook, splice, checkFor) {
        var text = fs.readFileSync(filename);
        if(!checkFor || !text.match(checkFor)) {
          text = text.toString().replace(hook, splice);
          fs.writeFileSync(filename, text);
        }
      }
      if(this.dest.exists('package.json')) {
        var srcPkg = JSON.parse(fs.readFileSync('package.json'));
        context.appName = srcPkg.name + 'App';
        var deps = {
          "dependencies": {
            "bcrypt-nodejs": "0.0.3",
            "body-parser": "^1.9.2",
            "compression": "^1.2.0",
            "connect-flash": "^0.1.1",
            "cookie-parser": "^1.3.3",
            "express": "^4.10.1",
            "express-session": "^1.9.1",
            "gzippo": "^0.2.0",
            "mongoose": "^3.8.18",
            "morgan": "^1.5.0",
            "passport": "^0.2.1"
          },
          "devDependencies": {
            "connect-modrewrite": "^0.7.9",
            "grunt": "^0.4.1",
            "grunt-autoprefixer": "^0.7.3",
            "grunt-concurrent": "^0.5.0",
            "grunt-connect-proxy": "^0.1.11",
            "grunt-contrib-clean": "^0.5.0",
            "grunt-contrib-compass": "^0.7.2",
            "grunt-contrib-concat": "^0.4.0",
            "grunt-contrib-connect": "^0.7.1",
            "grunt-contrib-copy": "^0.5.0",
            "grunt-contrib-cssmin": "^0.9.0",
            "grunt-contrib-htmlmin": "^0.3.0",
            "grunt-contrib-imagemin": "^0.8.1",
            "grunt-contrib-jshint": "^0.10.0",
            "grunt-contrib-uglify": "^0.4.0",
            "grunt-contrib-watch": "^0.6.1",
            "grunt-develop": "^0.4.0",
            "grunt-env": "^0.4.2",
            "grunt-filerev": "^0.2.1",
            "grunt-google-cdn": "^0.4.0",
            "grunt-newer": "^0.7.0",
            "grunt-ng-annotate": "^0.3.0",
            "grunt-svgmin": "^0.4.0",
            "grunt-usemin": "^2.1.1",
            "grunt-wiredep": "^1.7.0",
            "jshint-stylish": "^0.2.0",
            "load-grunt-tasks": "^0.4.0",
            "time-grunt": "^0.3.1"
          }
        };
        this._.extend(srcPkg.dependencies, deps.dependencies);
        this._.extend(srcPkg.devDependencies, deps.devDependencies);
        if(this.strategies.indexOf('local')!==-1) {
          srcPkg.dependencies['passport-local'] = '^1.0.0'; 
        }
        if(this.strategies.indexOf('twitter')!==-1) {
          srcPkg.dependencies['passport-twitter'] = '^1.0.2'; 
        }
        if(this.strategies.indexOf('facebook')!==-1) {
          srcPkg.dependencies['passport-facebook'] = '^1.0.3'; 
        }
        if(this.strategies.indexOf('github')!==-1) {
          srcPkg.dependencies['passport-github'] = '^0.1.5'; 
        }
        if(this.strategies.indexOf('google')!==-1) {
          srcPkg.dependencies['passport-google-oauth'] = '^0.1.5'; 
        }
        fs.writeFileSync('package.json', JSON.stringify(srcPkg, null, 2));
      }
      this.dest.mkdir('server');
      this.dest.mkdir('server/config');
      this.dest.mkdir('server/controllers');
      this.dest.mkdir('server/models');
      this.src.copy('_app.js','server/app.js');
      this.src.copy('_angular.js','server/angular.js');
      this.src.copy('_routes.js','server/routes.js');
      this.template('config/_local.env.js','server/config/local.env.js',{
        dburl:this.dburl,
        session:this.session
      });
      this.src.copy('config/_local.env.js.sample','server/config/local.env.js.sample');
      this.src.copy('config/_passport.js','server/config/passport.js');
      this.src.copy('models/_user.js','server/models/user.js');
      
      //angular bits
      var routeSplice = this.src.read('angular/_routecheck.js');
      rewriteFile('app/scripts/app.js', /  \.config\(function \(\$routeProvider\) {/, routeSplice);
      var loginRoute = '      .when(\'/\', {\n        templateUrl: \'views/main.html\',\n        controller: \'MainCtrl\',\n        resolve: {isLoggedIn:softLogin}\n      })\n      .when(\'/login\', {\n        templateUrl: \'views/login.html\',\n        controller: \'LoginCtrl\',\n        resolve: {isLoggedIn:softLogin}\n      })\n      .when(\'/profile\', {\n        templateUrl: \'views/profile.html\',\n        controller: \'ProfileCtrl\',\n        resolve: {isLoggedIn:checkLogin}\n      })';
      rewriteFile('app/scripts/app.js', /      \.when\('\/', {\n        templateUrl: 'views\/main.html',\n        controller: 'MainCtrl'\n      }\)/, loginRoute);

      this.dest.mkdir('app/scripts/services');
      this.dest.mkdir('app/fonts');
      this.dest.mkdir('app/favicon');
      this.directory('angular/favicon', 'app/favicon');
      this.template('angular/controllers/_login.js', 'app/scripts/controllers/login.js', context);
      this.template('angular/controllers/_nav.js', 'app/scripts/controllers/nav.js', context);
      this.template('angular/controllers/_profile.js', 'app/scripts/controllers/profile.js', context);
      this.template('angular/services/_user.js', 'app/scripts/services/user.js', context);
      this.template('angular/views/_login.html', 'app/views/login.html', {strategies:this.strategies});
      this.template('angular/views/_profile.html', 'app/views/profile.html', {strategies:this.strategies});
      this.src.copy('angular/_gruntfile.js', 'Gruntfile.js');
      
      //clean up index file
      var metasHtml = this.src.read('angular/_metas.html');
      rewriteFile('app/index.html', /    <meta name="viewport" content="width=device-width">/, metasHtml);
      rewriteFile('app/index.html', /<div(.|[\r\n])+<\/div>/, '<div class="container" ng-controller="NavCtrl">\r\n      <a href="/login" ng-hide="user.user">Login</a>\r\n      <a href="api/logout" target="_self" ng-show="user.user">Logout</a>\r\n      <div ng-view=""></div>\r\n    </div>');
      rewriteFile('app/index.html', /        <!-- endbuild -->/, '        <script src="scripts/controllers/login.js"></script>\r\n        <script src="scripts/controllers/nav.js"></script>\r\n        <script src="scripts/controllers/profile.js"></script>\r\n        <script src="scripts/services/user.js"></script>\r\n        <!-- endbuild -->');
    },

    projectfiles: function () {
      //this.src.copy('editorconfig', '.editorconfig');
      //this.src.copy('jshintrc', '.jshintrc');
    }
  },

  end: function () {
    this.strategies.forEach(function(strat){
      this.composeWith('oauth-api-server:strategy', {
        arguments:[strat],
        options:{
          key:this.keys[strat + 'Key'], 
          secret:this.keys[strat + 'Secret'],
          runFromGenerator:true
        }
      });
    }.bind(this));
    this.npmInstall();
  }
});

module.exports = OauthApiServerGenerator;
