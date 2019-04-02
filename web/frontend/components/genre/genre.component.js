import './genre.scss';
class GenreController {
  constructor($scope, $rootScope, $routeParams, $element, Cache, Logger, MediaElement, MediaPlayer, AppUtilities, Backend, AlloyDbService) {
    "ngInject";
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$routeParams = $routeParams;
    this.$element = $element;
    this.Cache = Cache;
    this.Logger = Logger;
    this.MediaElement = MediaElement;
    this.MediaPlayer = MediaPlayer;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    this.AlloyDbService = AlloyDbService;
    this.Logger.debug('genre-controller');
    this.AppUtilities.showLoader();
    $scope.artist = {};
    $scope.albums = [];
    $scope.genre = { tracks: [] }
    $scope.artistName = '';
    $scope.all_expanded = false;
    $scope.albums_expanded = true;
    $scope.genre.tracks_expanded = false;
    $scope.genre = this.$routeParams.id;

    $scope.getCoverArt = id => {
      return this.AlloyDbService.getCoverArt(id);
    }

    $scope.getGenre = () => {
      var cache = Cache.get($routeParams.id);

      if (cache) {
        $scope.genre = cache;
        this.AppUtilities.apply();
        this.AppUtilities.hideLoader();
      } else {
        if (AlloyDbService.isLoggedIn) {
          this.AlloyDbService.getGenre(this.$routeParams.id).then(result => {
            $scope.info = result;

            var randomTrack = $scope.info.tracks[Math.floor(Math.random() * $scope.info.tracks.length)];
            if (randomTrack) {
              $scope.info.image = this.AlloyDbService.getCoverArt({ track_id: randomTrack.id });
            }
            this.AppUtilities.apply();
            this.AppUtilities.hideLoader();
          });
        }
      }
    };

    $scope.toggleAlbums = () => {
      if ($scope.albums_expanded) $('#albumListContainer').hide();
      else $('#albumListContainer').show();
      $scope.albums_expanded = !$scope.albums_expanded;
    }

    $scope.toggleTracks = () => {
      if ($scope.genre.tracks_expanded) $('#trackListContainer').hide();
      else $('#trackListContainer').show();
      $scope.genre.tracks_expanded = !$scope.genre.tracks_expanded;
    }

    $scope.toggleAll = () => {
      $scope.genre.tracks_expanded = $scope.all_expanded;
      $scope.albums_expanded = $scope.all_expanded;

      if ($scope.albums_expanded) $('#albumListContainer').hide();
      else $('#albumListContainer').show();

      if ($scope.genre.tracks_expanded) $('#trackListContainer').hide();
      else $('#trackListContainer').show();

      $scope.all_expanded = !$scope.all_expanded;
    }

    $scope.refresh = () => {
      this.Logger.debug('refresh genre');
      Cache.put($routeParams.id, null);
      $scope.getGenre();
    };

    $scope.shuffle = () => {
      this.Logger.debug('shuffle play');
      $rootScope.tracks = AppUtilities.shuffle($scope.genre.tracks);
      MediaPlayer.loadTrack(0);
    };

    $rootScope.$on('loginStatusChange', (event, data) => {
      this.Logger.debug('Genre reload on loginsatuschange');
      $scope.refresh();
    });

    $scope.getGenre();
  }

  $onInit() {
    this.$element.addClass('vbox')
    this.$element.addClass('scrollable')
  };
}

export default {
  bindings: {},
  controller: GenreController,
  templateUrl: '/template/genre.jade'
};