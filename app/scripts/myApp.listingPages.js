angular.module('myApp.listingPages', ['ytCore','myApp.config'])

  .value('appCategories', ['funny','programming', 'web development'])

  .config(function($routeProvider, TPL_PATH) {
    $routeProvider.when('/',{
      controller : 'HomeCtrl',
      templateUrl : TPL_PATH + '/home.html',
      reloadOnSearch : false
    }).when('/watch/:id',{
      controller : 'WatchCtrl',
      templateUrl : TPL_PATH + '/watch.html',
      resolve: {
        videoInstance: ['ytVideo', '$location', function(ytVideo, $location) {
          //match the ID with a regex instead of using route params
          //since the route has not fully changed yet
          var id = $location.path().match(/watch\/([^ \/]+)(\/|$)/)[1];
          return ytVideo(id);
        }]
      }
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
  }])

  .controller('SearchFormCtrl', ['$scope', '$location',
                         function($scope,   $location) {

    $scope.search = function(q) {
      $location.search({ q : q });
    };
  }])

  .controller('WatchCtrl', ['$scope', '$location',  'videoInstance',
                    function($scope,   $location,    videoInstance) {

    $scope.video_id = videoInstance.id;
  }])
