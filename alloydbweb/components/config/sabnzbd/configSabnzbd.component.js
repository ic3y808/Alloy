import CryptoJS from "crypto-js";
class ConfigSabnzbdController {
  constructor($scope, $rootScope, Logger, MediaElement, MediaPlayer, AppUtilities, Backend) {
    "ngInject";
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.Logger = Logger;
    this.MediaElement = MediaElement;
    this.MediaPlayer = MediaPlayer;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    //this.sabnzbdService = sabnzbdService;
    this.Logger.debug("sabnzbd-controller");
  
    $scope.settings = {};

    $scope.testSettings = () => {
      if(this.$rootScope.socket)
       {this.$rootScope.socket.emit("test_sabnzbd_settings", $rootScope.settings.sabnzbd);}
    };


    var t = "<div class=\"popover\" role=\"tooltip\">" +
      "<div class=\"arrow\">" +
      "</div>" +
      "<h3 class=\"popover-header\"></h3>" +
      "<div class=\"popover-body\"></div>" +
      "</div>";


    $rootScope.socket.on("test_sabnzbd_connection_result", (data) => {
      if (data) {
        this.Logger.debug("sabnzbd connection result");
        this.Logger.debug(data);

        if (data) {
          var pop = $("#testSabnzbdConnectionButton").popover({
            html: true,
            // selector: "[rel=save-settings-popover]",
            trigger: "manual",
            //template: t,
            content: data.result,
            //container: ".PageContentBody-contentBody",
            placement: "top",
          });

          pop.popover("show");
          setTimeout(() => {
            pop.popover("hide");
          }, 3000);

        }
      }
    });

    $scope.generateConnectionString = () => {
      var url = "http://";
      if ($rootScope.settings.sabnzbd) {
        if ($rootScope.settings.sabnzbd.sabnzbd_use_ssl)
          {url = "https://";}
        url += $rootScope.settings.sabnzbd.sabnzbd_host;
        if ($rootScope.settings.sabnzbd.sabnzbd_include_port_in_url)
          {url += ":" + $rootScope.settings.sabnzbd.sabnzbd_port;}
        if ($rootScope.settings.sabnzbd.sabnzbd_url_base)
          {url += "/" + $rootScope.settings.sabnzbd.sabnzbd_url_base;}
        url += "/api";
      }
      return url;
    };

    $scope.previewConnectionString = () => {
      $scope.connectionStringPreview = $scope.generateConnectionString();
    };

    $rootScope.$watch("settings.sabnzbd ", (newVal, oldVal) =>  {
      $scope.previewConnectionString();
    });

  }
}

export default {
  bindings: {},
  controller: ConfigSabnzbdController,
  templateUrl: "/template/configSabnzbd.jade",

};