angular.module('myApp', ['ytCore', 'ngRoute', 'ngAnimate'])

  .constant('TPL_PATH', '/templates')

  .factory('getSet', function() {
    return function() {
      var val;
      return function(data) {
        return arguments.length ? (val = data) : val;
      };
    };
  })

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

  .run(        ['$rootScope', 'columnTemplate',
        function($rootScope,   columnTemplate) {
    $rootScope.getColumnTemplate = columnTemplate;
  }])

  .factory('columnTemplate', ['getSet', function(getSet) {
    return getSet();
  }])

  .factory('currentVideo', ['getSet', function(getSet) {
    return getSet();
  }])

  .controller('HomeCtrl', ['$scope', '$location', 'ytSearch', 'ytFeed', 'TPL_PATH', 'columnTemplate',
                   function($scope,   $location,   ytSearch,   ytFeed,   TPL_PATH,   columnTemplate) {

    columnTemplate(TPL_PATH + '/categories.html');

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
    };
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
      }).path('/');
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

  .controller('WatchCtrl', ['$scope', '$location',  'videoInstance', 'ytVideoComments', 'TPL_PATH', 'currentVideo', 'columnTemplate',
                    function($scope,   $location,    videoInstance,   ytVideoComments,   TPL_PATH,   currentVideo,   columnTemplate) {

    $scope.video_id = videoInstance.id;

    ytVideoComments(videoInstance.id).then(function(comments) {
      $scope.video_comments = comments;
    });

    currentVideo(videoInstance);
    columnTemplate(TPL_PATH + '/video-panel.html');

    $scope.$on('$destroy', function() {
      currentVideo(null);
    });
  }])

  .controller('VideoPanelCtrl', ['$scope', 'currentVideo',
                         function($scope,   currentVideo) {

    $scope.video = currentVideo();
  }]);
