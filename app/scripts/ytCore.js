angular.module('ytCore', [])

  .constant('YT_VIDEO_URL',   'https://gdata.youtube.com/feeds/api/videos/{ID}?v=2&alt=json&callback=JSON_CALLBACK')
  .constant('YT_VIDEO_COMMENTS_URL',   'https://gdata.youtube.com/feeds/api/videos/{ID}/comments?v=2&alt=json&callback=JSON_CALLBACK')
  .constant('YT_SEARCH_URL',  'https://gdata.youtube.com/feeds/api/videos/?q={Q}&v=2&alt=json&callback=JSON_CALLBACK')
  .constant('YT_POPULAR_URL', 'https://gdata.youtube.com/feeds/api/standardfeeds/{FEED}?alt=json&callback=JSON_CALLBACK')
  .constant('YT_EMBED_URL',   'http://www.youtube.com/embed/{ID}?autoplay=1')

  .config(['$sceDelegateProvider', function($sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['self', 'http://www.youtube.com/**']);
  }])

  .factory('ytFeed', ['ytVideos', 'YT_POPULAR_URL',
              function(ytVideos,   YT_POPULAR_URL) {
    return function(feed) {
      var url = YT_POPULAR_URL.replace('{FEED}', feed);
      return ytVideos(url);
    }
  }])

  .factory('ytSearch', ['ytVideos', 'YT_SEARCH_URL',
                function(ytVideos,   YT_SEARCH_URL) {
    return function(q) {
      var url = YT_SEARCH_URL.replace('{Q}', q || '');
      return ytVideos(url);
    }
  }])

  .factory('ytVideos', ['$q', '$http', 'ytVideoPrepare',
                function($q,   $http,   ytVideoPrepare) {
    return function(url) {
      var defer = $q.defer();
      $http.jsonp(url)
        .success(function(response) {
          var results = [];
          angular.forEach(response.feed.entry, function(entry) {
            results.push(ytVideoPrepare(entry));
          });
          defer.resolve(results);
        })
        .error(function() {
          return 'failure';
        });
      return defer.promise;
    };
  }])

  .factory('ytVideo', ['$q', '$http', 'ytVideoPrepare', 'YT_VIDEO_URL',
               function($q,   $http,   ytVideoPrepare,   YT_VIDEO_URL) {

    return function(id) {
      var defer = $q.defer();
      var url = YT_VIDEO_URL.replace('{ID}', id);
      $http.jsonp(url)
        .success(function(response) {
          defer.resolve(ytVideoPrepare(response.entry));
        })
        .error(function() {
          return 'failure';
        });
      return defer.promise;
    };
  }])

  .factory('ytVideoPrepare', ['ytCreateEmbedURL',
                      function(ytCreateEmbedURL) {
    return function(entry) {
      var $media      = entry.media$group;
      var id          = $media.yt$videoid.$t;
      var thumbnails  = [];

      var hqVideo;
      angular.forEach($media.media$thumbnail || [], function(thumb) {
        var image = {
          width : thumb.width,
          height : thumb.height,
          url : thumb.url,
          name : thumb.yt$name
        }
        if(image.name == 'hqdefault') {
          hqVideo = hqVideo || image;
        }
        thumbnails.push(image);
      });

      return {
        id : id,
        image : hqVideo || thumbnails[0],
        thumbnails : thumbnails,
        title : entry.title.$t,
        description : $media.media$description.$t,
        rating : entry.gd$rating ? parseInt(entry.gd$rating.average) : 0,
        keywords : $media.media$keywords || '',
        embedUrl : ytCreateEmbedURL(id)
      };
    };
  }])

  .factory('ytVideoComments', ['$http', '$q', 'YT_VIDEO_COMMENTS_URL',
                       function($http,   $q,   YT_VIDEO_COMMENTS_URL) {
    return function(id) {
      var url = YT_VIDEO_COMMENTS_URL.replace('{ID}', id);
      var defer = $q.defer();
      $http.jsonp(url)
        .success(function(response) {
          var comments = [];
          angular.forEach(response.feed.entry, function(comment) {
            comments.push({
              content : comment.content.$t
            });
          });
          defer.resolve(comments);
        })
        .error(function() {
          defer.reject();
        });
      return defer.promise;
    };
  }])

  .factory('ytCreateEmbedURL', ['YT_EMBED_URL',
                        function(YT_EMBED_URL) {
    return function(id) {
      return YT_EMBED_URL.replace('{ID}', id);
    }
  }])

  .directive('ytVideoPlayer', ['ytCreateEmbedURL',
                       function(ytCreateEmbedURL) {
    return {
      controller: ['$scope', function($scope) {
        $scope.width  = parseInt($scope.width) || 560;
        $scope.height = parseInt($scope.height) || 315;
        $scope.video_src = ytCreateEmbedURL($scope.video_id);
      }],
      scope: {
        video_id: '@ytVideoPlayer',
        width: '@width',
        height: '@height'
      },
      template: '<iframe ng-src="{{ video_src }}" ' +
                        'class="yt-video-player"></iframe>',
      replace: true
    }
  }]);
