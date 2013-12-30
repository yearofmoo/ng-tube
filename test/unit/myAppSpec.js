describe('myApp', function() {

  beforeEach(module('myApp'));

  describe('HomeCtrl', function() {
    it('should prepare the latest videos', function() {
      module(function($provide) {
        $provide.factory('ytVideos', function($q) {
          return function(q) {
            var defer = $q.defer();
            defer.resolve({});
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
        expect(scope.latestVideos).toEqual({});
        expect(scope.popularVideos).toEqual({});
      });
    });
  });
});
