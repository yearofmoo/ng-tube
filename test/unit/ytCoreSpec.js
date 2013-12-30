describe('ytCore', function() {

  beforeEach(module('ytCore'));

  describe('ytVideo', function() {
    it('should properly download the video in raw form', function() {
      module(function($provide) {
        $provide.value('ytVideoPrepare', function(rawValue) {
          return rawValue;
        });
      })
      inject(function(ytVideo, $httpBackend, $rootScope) {
        $httpBackend.expect('JSONP',
          'https://gdata.youtube.com/feeds/api/videos/' + 
            'my-id?v=2&alt=json&callback=JSON_CALLBACK')
          .respond(200, { entry : ["raw"] });

        ytVideo('my-id').then(function(response) {
          expect(response).toEqual(["raw"]);
        });
        $rootScope.$digest();
        $httpBackend.flush();
      });
    });
  });

  describe('ytSearch', function() {
    beforeEach(module(function($provide) {
      $provide.value('ytVideoPrepare', function(rawValue) {
        return '_' + rawValue + '_';
      });
    }));

    it('should properly perform a JSONP search on all youtube videos',
      inject(function(ytSearch, $httpBackend, $rootScope) {

      $httpBackend.expect('JSONP',
        'https://gdata.youtube.com/feeds/api/videos/?v=2&alt=json&callback=JSON_CALLBACK&q=cars')
        .respond(200, { feed: { entry: ["one","two"] } });

      ytSearch('cars').then(function(results) {
        expect(results).toEqual(["_one_","_two_"]);
      });

      $rootScope.$digest();
      $httpBackend.flush();
    }));

    it('should search the categories, set the sorting and perform a query search when an object is provided to ytSearch',
      inject(function(ytSearch, $httpBackend, $rootScope) {

      $httpBackend.expect('JSONP',
        'https://gdata.youtube.com/feeds/api/videos/?v=2&alt=json&callback=JSON_CALLBACK' +
        '&q=cars&category=funny&orderby=duration'
      ).respond(200, { feed: { entry: ["one","two"] } });

      ytSearch({
        q : 'cars',
        c : 'funny',
        o : 'duration' 
      });

      $rootScope.$digest();
      $httpBackend.flush();
    }));
  });

  describe('ytVideoPrepare', function() {
    it('should prepare the video properly given raw JSON form', function() {
      inject(function(ytVideoPrepare, $rootScope, ytCreateEmbedURL) {
        var inputData = {
          gd$rating : {
            average : 5
          },
          title : {
            $t : 'my-title'
          },
          media$group : {
            media$thumbnail : [
              { width : 10, height : 20, url : 'http://url-1', yt$name : 'sq' },
              { width : 20, height : 40, url : 'http://url-2', yt$name : 'hqdefault' }
            ],
            yt$videoid : {
              $t : 'my-id-123'
            },
            media$description : {
              $t : 'my-description'
            },
            media$keywords : 'one two three four'
          }
        };

        var response = ytVideoPrepare(inputData);

        expect(response.id).toBe('my-id-123');
        expect(response.title).toBe('my-title');
        expect(response.description).toBe('my-description');
        expect(response.rating).toBe(5);
        expect(response.keywords).toBe('one two three four');
        expect(response.embedUrl).toBe(ytCreateEmbedURL(response.id));

        expect(response.thumbnails).toEqual([
          { width : 10, height : 20, url : 'http://url-1', name : 'sq' },
          { width : 20, height : 40, url : 'http://url-2', name : 'hqdefault' }
        ]);

        expect(response.image).toBe(response.thumbnails[1]);
      });
    });
  });

});
