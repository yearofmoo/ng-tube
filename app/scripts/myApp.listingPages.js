angular.module('myApp.listingPages', ['ytCore','myApp.config'])

  .value('appCategories', ['funny','programming', 'web development'])

  .config(function($routeProvider, TPL_PATH) {
    $routeProvider.when('/',{
      controller : 'HomeCtrl',
      templateUrl : TPL_PATH + '/home.html',
      reloadOnSearch : false
    });
  })

  .controller('HomeCtrl', ['$scope', '$location', 'ytSearch', 'ytFeed', 'appCategories',
                   function($scope,   $location,   ytSearch,   ytFeed,   appCategories) {

    $scope.$watch(function() {
      return $location.search().category || $location.search().q;
    }, function(q) {
      ytSearch(q).then(function(videos) {
        $scope.latestVideos = videos;
      });

      ytFeed('most_popular').then(function(videos) {
        $scope.popularVideos = videos;
      });

      $scope.categories = appCategories;
    });
  }]);
