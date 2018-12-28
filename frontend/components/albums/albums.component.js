import './albums.scss';
class AlbumsController {
  constructor($scope, $rootScope, $location, AppUtilities, Backend, MediaPlayer, AlloyDbService) {
    "ngInject";
    this.$scope = $scope;
    this.$rootScope = $rootScope;
    this.AppUtilities = AppUtilities;
    this.Backend = Backend;
    this.MediaPlayer = MediaPlayer;
    this.AlloyDbService = AlloyDbService;
    this.Backend.debug('albums-controller');
    var that = this;

    var columnDefs = [{
      headerName: "Album Name",
      field: "name"
    },
    {
      headerName: "Artist",
      field: "base_path"
    },
    {
      headerName: "Genre",
      field: "genre"
    },
    {
      headerName: "Path",
      field: "path"
    },
    {
      headerName: "Tracks",
      field: "trackCount",
      width: 150
    },
    {
      headerName: "Plays",
      field: "playCount",
      width: 150
    }
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
      getRowNodeId: function (data) {
        return data.id;
      },
      rowMultiSelectWithClick: false,
      onModelUpdated: function (data) {
        if (data && data.api) {
          data.api.doLayout();
          data.api.sizeColumnsToFit();
        }
      },
      onGridReady: function () {
        $scope.reloadAlbums();
        $scope.gridOptions.api.sizeColumnsToFit();
        $scope.gridOptions.api.addGlobalListener(
          function (foo) {
            _.debounce(function () {
              $scope.gridOptions.api.sizeColumnsToFit();
            }, 300);

          }
        );
      },
      onSelectionChanged: function (data) {
        var selectedRow = $scope.gridOptions.api.getSelectedRows()[0];

        $location.path("/album/" + selectedRow.id.toString());
        if (!$scope.$$phase) {
          $scope.$apply();
        }
        that.Backend.debug("/album/" + selectedRow.id.toString());
      }
    };

    $scope.reloadAlbums = function () {
      $scope.albums = [];
      AlloyDbService.getAlbums().then(function (result) {
        $scope.albums = result;
        if ($scope.gridOptions.api) {
          $scope.gridOptions.api.setRowData($scope.albums);
          $scope.gridOptions.api.sizeColumnsToFit();
          AppUtilities.apply();
          AppUtilities.hideLoader();
        }
      });
    };

    $rootScope.$on('loginStatusChange', function (event, data) {
      that.Backend.debug('Albums reload on loginsatuschange');
      $scope.reloadAlbums();
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
  controller: AlbumsController,
  templateUrl: '/template/albums.jade'
};