angular.module('myApp', ['ytCore', 'ngRoute', 'ngAnimate'])

  .constant('TPL_PATH', './templates')

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

  .run(        ['$rootScope', 'columnTemplate', 'TPL_PATH',
        function($rootScope,   columnTemplate,   TPL_PATH) {
    $rootScope.tpl = function(file) {
      return TPL_PATH + '/' + file + '.html';
    };

    $rootScope.$on('$routeChangeStart', function() {
    });
  }])

  .directive('yrScrollToTop', ['$window', '$rootScope', function($window, $rootScope) {
    return function() {
      $rootScope.$on('$routeChangeStart', function() {
        $window.scrollTo(0, 0);
      });
    };
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

    var layout;
    $scope.setLayout = function(l) {
      layout = l;
    };

    $scope.isLayout = function(l) {
      return layout == l;
    };

    $scope.$watchCollection(function() {
      return $location.search();
    }, function(data) {
      $scope.setLayout('pictures');

      var c = data.c;
      if(c && c.length > 0) {
        $scope.searchTerm = c;
        $scope.searchMethod = 'category';
      } else {
        data.q = data.q || 'AngularJS';
        $scope.searchMethod = 'query';
        $scope.searchTerm = data.q;
      }

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
  }])

  .controller('SearchFormCtrl', ['$scope', '$location',
                         function($scope,   $location) {

    $scope.search = function() {
      var order, category, q = $scope.q;
      if($scope.advanced) {
        order = $scope.advanced.orderby;
        category = $scope.advanced.category;
      }

      $scope.advanced = false;

      $location.search({
        q : q || '',
        c : category || '',
        o : order || ''
      }).path('/');
    };

    $scope.$on('$routeChangeStart', function() {
      $scope.advanced = false;
    });

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

  .controller('WatchCtrl', ['$scope', '$location',  'videoInstance', 'ytVideoComments', 'TPL_PATH', 'currentVideo', 'columnTemplate', 'ytSearch', 'ytRelatedVideos',
                    function($scope,   $location,    videoInstance,   ytVideoComments,   TPL_PATH,   currentVideo,   columnTemplate,   ytSearch,   ytRelatedVideos) {

    var videoID = videoInstance.id;
    $scope.video_id = videoID;
    $scope.video = videoInstance;

    ytVideoComments(videoInstance.id).then(function(comments) {
      $scope.video_comments = comments;
    });

    currentVideo(videoInstance);
    columnTemplate(TPL_PATH + '/video-panel.html');

    ytRelatedVideos(videoID).then(function(videos) {
      $scope.relatedVideos = videos;
    });

    $scope.$on('$destroy', function() {
      currentVideo(null);
    });
  }])

  .controller('VideoPanelCtrl', ['$scope', 'currentVideo',
                         function($scope,   currentVideo) {

    $scope.video = currentVideo();
  }]);
