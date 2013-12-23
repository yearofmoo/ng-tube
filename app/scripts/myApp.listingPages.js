angular.module('myApp.listingPages', ['ytCore','myApp.config'])

  .value('appCategories', [
    'funny','programming', 'web development',
    'music', 'video games'
  ])

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

  .run(['$rootScope', 'TPL_PATH', function($rootScope, TPL_PATH) {
    var template;
    $rootScope.setColumnTemplate = function(tpl) {
      template = TPL_PATH + tpl;
    };
    $rootScope.getColumnTemplate = function() {
      return template;
    };

    var video;
    $rootScope.setCurrentVideo = function(v) {
      video = v;
    };
    $rootScope.getCurrentVideo = function() {
      return video;
    };
  }])

  .controller('HomeCtrl', ['$scope', '$location', 'ytSearch', 'ytFeed',
                   function($scope,   $location,   ytSearch,   ytFeed) {

    $scope.setColumnTemplate('/categories.html');

    $scope.$watchCollection(function() {
      return $location.search();
    }, function(data) {
      var q = data.q;
      $scope.searchTerm = q && q.length > 0 && q;

      ytSearch(data).then(function(videos) {
        $scope.latestVideos = videos;
      });

      ytFeed('most_popular').then(function(videos) {
        $scope.popularVideos = videos;
      });
    });
  }])

  .filter('limit', function() {
    return function(results, limit) {
      return results && results.slice(0, limit);
    }
  })

  .controller('CategoryListCtrl', ['$scope', 'appCategories',
                           function($scope,   appCategories) {
    $scope.categories = appCategories;
    //var categoryMatch = appCategories.indexOf(q);
    //$scope.currentCategory = categoryMatch >= 0 ? appCategories[categoryMatch] : null;
  }])

  .controller('SearchFormCtrl', ['$scope', '$location',
                         function($scope,   $location) {

    $scope.search = function() {
      var order, category, q = $scope.q;
      if($scope.advanced) {
        order = $scope.advanced.orderby;
        category = $scope.advanced.category;
      }
      $location.search({
                 q : q || '',
                 c : category || '',
                 o : order || ''
               }).path('/')
    };

    $scope.orderingOptions = [
      'relevance',
      'published',
      'viewCount',
      'rating',
      'position',
      'commentCount',
      'published',
      'reversedPosition',
      'title',
      'viewCount'
    ];
  }])

  .controller('WatchCtrl', ['$scope', '$location',  'videoInstance', 'ytVideoComments',
                    function($scope,   $location,    videoInstance,   ytVideoComments) {

    $scope.video_id = videoInstance.id;

    ytVideoComments(videoInstance.id).then(function(comments) {
      $scope.video_comments = comments;
    });

    $scope.setColumnTemplate('/video-panel.html');
    $scope.setCurrentVideo(videoInstance);

    $scope.$on('$destroy', function() {
      $scope.setCurrentVideo(null);
    });
  }])

  .controller('VideoPanelCtrl', ['$scope',
                         function($scope) {

    $scope.video = $scope.getCurrentVideo();
  }]);
