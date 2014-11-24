  .config(function ($routeProvider, $locationProvider) {
  
    var checkLogin = function($q, $location, $http, User) {
      var deferred = $q.defer();
      $http.get('/api/user')
      .success(function(user){
        if(user) {
          User.details = user;
          deferred.resolve(user);
        }
        else {
          deferred.reject();
          $location.url('/login');
        }
      });
      return deferred.promise;
    };
  
    var softLogin = function($q, $http, User) {
      var deferred = $q.defer();
      $http.get('/api/user')
      .success(function(user) {
        User.details = user;
        deferred.resolve(user);
      });
    };
    
    $locationProvider.html5Mode(true);
    