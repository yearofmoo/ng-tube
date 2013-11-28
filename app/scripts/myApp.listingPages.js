angular.module('myApp.listingPages', [])

  .controller('HomeCtrl', ['$scope', 'ytSearch', function($scope, ytSearch) {
    ytSearch().then(function(videos) {
      $scope.latestVideos = videos;
    });
  }]);
