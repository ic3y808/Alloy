import './fresh.scss';
class FreshController {
  constructor($scope, $rootScope, MediaElement, MediaPlayer, AppUtilities, Backend, AlloyDbService) {
    "ngInject";
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.MediaElement = MediaElement;
    this.MediaPlayer = MediaPlayer;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    this.AlloyDbService = AlloyDbService;
    this.Backend.debug('fresh-controller');
    $scope.albums = [];
    $scope.tracks = [];
    $scope.continousPlay = true;
    $('#freshAlbums').hide();
    var that = this;
    var columnDefs = [{
      headerName: "#",
      field: "no",
      width: 75,
      suppressSizeToFit: true
    },
    {
      headerName: "Title",
      field: "title"
    },
    {
      headerName: "Artist",
      field: "artist"
    },
    {
      headerName: "Album",
      field: "album"
    },
    {
      headerName: "Genre",
      field: "genre"
    },
    {
      headerName: "Plays",
      field: "playCount",
      width: 75,
      suppressSizeToFit: true
    },
    ];

    $scope.gridOptions = {
      columnDefs: columnDefs,
      rowData: null,
      rowSelection: 'single',
      enableColResize: true,
      enableSorting: true,
      enableFilter: true,
      rowDeselection: true,
      animateRows: true,
      rowClassRules: {
        'current-track': function (params) {
          if ($scope.gridOptions.api) $scope.gridOptions.api.deselectAll();
          return MediaPlayer.checkIfNowPlaying(params.data);
        }
      },
      getRowNodeId: function (data) {
        return data.id;
      },
      onModelUpdated: function (data) {
        if (data && data.api) {
          data.api.doLayout();
          data.api.sizeColumnsToFit();
        }
      },
      onGridReady: function () {
        setTimeout(function () {
          $scope.refresh();
          $scope.gridOptions.api.sizeColumnsToFit();
          $scope.gridOptions.api.addGlobalListener(
            function (foo) {
              _.debounce(function () {
                $scope.gridOptions.api.sizeColumnsToFit();
              }, 300);
            }
          );
        }, 750);
      },
      onRowDoubleClicked: function (e) {
        var selectedRow = e.data;
        if (selectedRow) {
          MediaPlayer.tracks = $scope.tracks;
          var index = _.findIndex(MediaPlayer.tracks, function (track) {
            return track.id === selectedRow.id;
          });
          MediaPlayer.loadTrack(index);
        }
      },
    };

    $scope.toggleContinousPlay = function () {
      $scope.continousPlay = !$scope.continousPlay;
    };

    $scope.getAlbum = function (id, ) {
      that.AlloyDbService.getAlbum(id).then(function (result) {
        if (result) {
          that.$scope.tracks = result.tracks;

          if (that.$scope.gridOptions && that.$scope.gridOptions.api) {
            that.$scope.gridOptions.api.setRowData(that.$scope.tracks);
            that.$scope.gridOptions.api.doLayout();
            that.$scope.gridOptions.api.sizeColumnsToFit();
          }
          that.AppUtilities.apply();
        }
      });
    }

    $scope.getCoverArt = function (id) {
      return that.AlloyDbService.getCoverArt(id);
    }

    $scope.refresh = function () {

      $scope.albums = [];
      that.AlloyDbService.getFresh(30).then(function (newestCollection) {
        $scope.albums = newestCollection.albums;

        setTimeout(function () {
          $scope.flip = $("#coverflow").flipster({
            start: 0,
            fadeIn: 100,
            autoplay: false,
            style: 'carousel',
            spacing: -.2,
            buttons: true,
            nav: false,
            onItemSwitch: function (currentItem, previousItem) {
              var id = currentItem.dataset.flipTitle;
              that.$scope.getAlbum(id);
            }
          });
          that.AppUtilities.apply();
          $('#freshAlbums').show();
          $scope.flip.flipster('index');
          if ($scope.albums && $scope.albums.length > 0) {
            $scope.getAlbum($scope.albums[0].album_id);
          }

          AppUtilities.hideLoader();
        }, 750);
      });

      AppUtilities.hideLoader();
    };

    $scope.startRadio = function () {
      var track = that.MediaPlayer.selectedTrack();
      if (!track || !track.artistId) {
        track = $scope.tracks[0];
      }

      AlloyDbService.getSimilarSongs2(track.artistId).then(function (similarSongs) {
        that.Backend.debug('starting radio');
        if (similarSongs && similarSongs.song) {
          MediaPlayer.tracks = similarSongs.song;
          MediaPlayer.loadTrack(0);
        }
      });
    };

    $scope.shuffle = function () {
      that.Backend.debug('shuffle play');
      MediaPlayer.tracks = AppUtilities.shuffle($scope.tracks);
      MediaPlayer.loadTrack(0);
    };

    $rootScope.$on('playlistEndEvent', function (event, data) {
      if ($scope.continousPlay) {
        $scope.flip.flipster('next');
        setTimeout(function () {
          MediaPlayer.tracks = $scope.tracks;
          MediaPlayer.loadTrack(0);
        }, 500);
      }
    });

    $rootScope.$on('trackChangedEvent', function (event, data) {
      if ($scope.gridOptions && $scope.gridOptions.api) {
        $scope.gridOptions.api.redrawRows({
          force: true
        });
        $scope.gridOptions.api.doLayout();
        $scope.gridOptions.api.sizeColumnsToFit();
      }
    });

    $rootScope.$on('loginStatusChange', function (event, data) {
      that.Backend.debug('Fresh reload on loginsatuschange');
      $scope.refresh();
    });

    $rootScope.$on('menuSizeChange', function (event, currentState) {
      if ($scope.gridOptions && $scope.gridOptions.api) {
        $scope.gridOptions.api.doLayout();
        $scope.gridOptions.api.sizeColumnsToFit();
      }
    });

    $rootScope.$on('windowResized', function (event, data) {
      if ($scope.gridOptions && $scope.gridOptions.api) {
        $scope.gridOptions.api.doLayout();
        $scope.gridOptions.api.sizeColumnsToFit();
      }
    });
  }
}

export default {
  bindings: {},
  controller: FreshController,
  templateUrl: '/template/fresh.jade'
};