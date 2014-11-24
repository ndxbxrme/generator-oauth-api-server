'use strict';

/**
 * @ngdoc function
 * @name myApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myApp
 */
angular.module('<%= appName %>')
.controller('LoginCtrl', function ($scope, $http, $location) {
  $scope.login = function(){
    $http.post('/api/login', $scope.userform)
    .success(function(){
      $location.path('/');
    });
  };
  $scope.signup = function(){
    $http.post('/api/signup', $scope.userform)
    .success(function(){
      $location.path('/');
    });
  };
});
