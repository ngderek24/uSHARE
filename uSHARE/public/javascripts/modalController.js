var app = angular.module('ushare');

app.controller('modalInstanceCtrl', ['$scope', "$uibModalInstance", 'metadata', function ($scope, $uibModalInstance, metadata) {
  $scope.metadata = metadata;

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

app.controller('modalController', ['$uibModal', 'scopeSharer', function ($uibModal, scopeSharer) {
  var ctrl = this;

  ctrl.animationsEnabled = true;

  ctrl.initModal = function(metadata){
    if(metadata.role == "host"){
      ctrl.metadata = {
        host: true,
        btnLabel: "Close Room",
        modalBody: "Clicking ok will kick everyone else out as well!"
      }
    }else{
      ctrl.metadata = {
        host: false,
        btnLabel: "Leave Room",
        modalBody: ""
      }
    }
  }

  ctrl.open = function (metadata, size, parentSelector) {
    var modalInstance = $uibModal.open({
      animation: ctrl.animationsEnabled,
      templateUrl: '/partials/modal',
      controller: 'modalInstanceCtrl',
      size: size,
      resolve: {
        metadata: function () {
          return ctrl.metadata;
        }
      }
    });

    //On close & on cancel
    modalInstance.result.then(function () {
      if(scopeSharer.getScope()){
        scopeSharer.getScope().postModal();
      }
    }, function () {
      
    });
  };
}]);