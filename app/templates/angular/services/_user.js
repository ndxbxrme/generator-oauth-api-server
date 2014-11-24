'use strict';

/**
 * @ngdoc service
 * @name myApp.User
 * @description
 * # User
 * Factory in the myApp.
 */
angular.module('<%= appName %>')
  .factory('User', function () {

    var details;
    var message;

    return {
      details:details,
      message:message
    };
  });
