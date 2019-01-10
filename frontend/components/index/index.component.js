class IndexController {
  constructor($scope, $rootScope, MediaElement, MediaPlayer, AppUtilities, Backend, AlloyDbService) {
    "ngInject";
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.MediaElement = MediaElement;
    this.MediaPlayer = MediaPlayer;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    this.AlloyDbService = AlloyDbService;
    this.Backend.debug('index-controller');
    $scope.artists = [];
    var that = this;

    $scope.reloadArtists = function () {
      $scope.artists = [];
      var getMusicFoldersIndex = that.AlloyDbService.getMusicFoldersIndex();
      if (getMusicFoldersIndex) {
        getMusicFoldersIndex.then(function (result) {
          $scope.artists = result;
          that.AppUtilities.apply();
          that.AppUtilities.hideLoader();
        });
      }
    };

    $rootScope.$on('loginStatusChange', function (event, data) {
      that.Backend.debug('Index reload on loginsatuschange');
      $scope.reloadArtists();
    });

    $scope.reloadArtists();
  }
}

export default {
  bindings: {},
  controller: IndexController,
  templateUrl: '/template/index-view.jade'
};