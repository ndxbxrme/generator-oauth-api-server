'use strict';
var util = require('util'),
    yeoman = require('yeoman-generator'),
    fs = require('fs'),
    misUtils = require('../mis-utils');


var OauthApiServerGenerator = yeoman.generators.NamedBase.extend({
  initializing: function () {
    //this.log('You called the oauth-api-server subgenerator with the argument ' + this.name + '.');
  },
  prompting: function() {
    var done = this.async();
    if(!this.options.key && this.options.key!=='' && this.name!=='local') {
      var prompts = [
        {
          type: 'input',
          name: 'key',
          message: this._.humanize(this.name) + ' key'
        },
        {
          type: 'input',
          name: 'secret',
          message: this._.humanize(this.name) + ' secret'
        }
      ];
      this.prompt(prompts, function(props){
        this.key = props.key;
        this.secret = props.secret;
        done();
      });
    }
    else {
      this.key = this.options.key;
      this.secret = this.options.secret;
      done(); 
    }
  },
  writing: function () {
    if(!this.options.runFromGenerator && this.dest.exists('package.json')) {
      console.log('rewriting package.json');
      var srcPkg = JSON.parse(fs.readFileSync('package.json'));
      if(this.name==='local') {
        srcPkg.dependencies['passport-local'] = '^1.0.0'; 
      }
      if(this.name==='twitter') {
        srcPkg.dependencies['passport-twitter'] = '^1.0.2'; 
      }
      if(this.name==='facebook') {
        srcPkg.dependencies['passport-facebook'] = '^1.0.3'; 
      }
      if(this.name==='github') {
        srcPkg.dependencies['passport-github'] = '^0.1.5'; 
      }
      if(this.name==='google') {
        srcPkg.dependencies['passport-google-oauth'] = '^0.1.5'; 
      }
      fs.writeFileSync('package.json', JSON.stringify(srcPkg, null, 2));
    }
    
    var strategyJs = this.src.read('_strategies/_' + this.name + '.js');
    
    var toSplice = ',\n  ' + this.name.toUpperCase() + '_KEY:\'' + this.key +'\',\n  ' + this.name.toUpperCase() + '_SECRET:\'' + this.session + '\',\n  ' + this.name.toUpperCase() + '_CALLBACK:\'http://localhost:9000/api/' + this.name + '/callback\'\n}';
    misUtils.rewriteFile('server/config/local.env.js', /\n}/, toSplice);
    
    var passportJs = strategyJs.match(/\/\/PASSPORT(.|[\r\n])*\/\/END:PASSPORT/gi)[0].replace(/\/\/(END:)*PASSPORT/g,'') + '\r\n  //end:strategies';
    misUtils.rewriteFile('server/config/passport.js', /  \/\/end:strategies/, passportJs);
    
    var requireJs = 'require(\'../models/user\'),\r\n' + strategyJs.match(/\/\/REQUIRE(.|[\r\n])*\/\/END:REQUIRE/gi)[0].replace(/\/\/(END:)*REQUIRE/g,'').replace(/[\n\r]*/g,'');
    misUtils.rewriteFile('server/config/passport.js', 'require(\'../models/user\')', requireJs);
    
    var routesJs = strategyJs.match(/\/\/ROUTES(.|[\r\n])*\/\/END:ROUTES/gi)[0].replace(/\/\/(END:)*ROUTES/g,'') + '\r\n  //end:strategy-routes';
    misUtils.rewriteFile('server/routes.js', /  \/\/end:strategy-routes/, routesJs);
    
    if(this.name==='local') {
      var loginForm = '  <div class="login-form">\r\n    <input type="text" ng-model="userform.email" />\r\n    <input type="password" ng-model="userform.password" />\r\n    <input type="submit" value="login" />\r\n    <input type="button" value="sign up" ng-click="signup()">\r\n  </div>\r\n</form>';
      misUtils.rewriteFile('app/views/login.html', /<\/form>/, loginForm);
    }
    else {
      misUtils.rewriteFile('app/views/login.html', /<\/form>/, '  <a href="/api/' + this.name + '" target="_self">' + this._.humanize(this.name) + '</a>\r\n</form>'); 
    }
    
    if(this.name==='local') {
      
    }
    else {
      misUtils.rewriteFile('app/views/profile.html', /<!--end:strategies-->/, '<a href="/api/connect/' + this.name + '" target="_self" ng-hide="user.details.' + this.name + '.token">Connect ' + this._.humanize(this.name) + '</a>\n<a href="/api/unlink/' + this.name + '" target="_self" ng-show="user.details.' + this.name + '.token">Unlink ' + this._.humanize(this.name) + '</a>\n<!--end:strategies-->');
    }
    //console.log(passportJs);
    //this.src.copy('somefile.js', 'somefile.js');
  },
  end: function() {
    if(!this.options.runFromGenerator) {
      this.npmInstall();
    }
  }
});

module.exports = OauthApiServerGenerator;
