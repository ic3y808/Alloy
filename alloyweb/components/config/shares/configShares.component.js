import CryptoJS from "crypto-js";
class ConfigSharesController {
  constructor($scope, $rootScope, $routeParams, $timeout, $element, AlloyDbService, AppUtilities, Backend, Cache, Logger, MediaElement, MediaPlayer) {
    "ngInject";
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.$routeParams = $routeParams;
    this.$timeout = $timeout;
    this.$element = $element;
    this.AlloyDbService = AlloyDbService;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    this.Cache = Cache;
    this.Logger = Logger;
    this.MediaElement = MediaElement;
    this.MediaPlayer = MediaPlayer;
    this.Logger.debug("config-shares-controller");

    $scope.getShares = () => {

      var shares = this.AlloyDbService.getShares($routeParams.id);
      if (shares) {
        shares.then((info) => {
          $scope.shares = info.shares;
          this.AppUtilities.apply();
          this.AppUtilities.hideLoader();
        });
      }
    };

    $scope.refresh = () => {
      this.Logger.debug("refresh shares");
      $scope.getShares();
    };

    $scope.copyShare = (id) => {
      var link = this.AlloyDbService.getShareLink(id);
      if (link) {
        link.then((result) => {
          this.AppUtilities.copyTextToClipboard(result.url);
        });
      }
    };

    $scope.deleteShare = (id) => {
      var del = this.AlloyDbService.deleteShare(id);
      if (del) {
        del.then((result) => {
          $scope.refresh();
          this.AppUtilities.apply();
        });
      }
    };

    $rootScope.$on("loginStatusChange", (event, data) => {
      this.Logger.debug("Shares reload on loginsatuschange");
      $scope.getShares();
    });

    $scope.getShares();

  }
}

export default {
  bindings: {},
  controller: ConfigSharesController,
  templateUrl: "/template/configShares.jade"

};