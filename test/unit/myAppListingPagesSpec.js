describe('myApp.listingPages', function() {

  beforeEach(module('myApp.listingPages'));

  describe('HomeCtrl', function() {
    it('should prepare the latest videos', function() {
      module(function($provide) {
        $provide.factory('ytSearch', function($q) {
          return function(q) {
            var defer = $q.defer();
            defer.resolve([q || 'latest']);
            return defer.promise;
          };
        });
      });
      inject(function($rootScope, $controller) {
        var scope = $rootScope.$new();
        $controller('HomeCtrl', {
          $scope : scope
        });

        $rootScope.$digest();
        expect(scope.latestVideos).toEqual(['latest']);
      });
    });
  });
});
