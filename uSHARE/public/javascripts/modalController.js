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
    scopeSharer.setChildScope(this);

    if(metadata.role == "host"){
      ctrl.metadata = {
        host: true,
        btnLabel: "Close Room",
        modalTitle: "Close Room?",
        modalBody: "Clicking ok will kick everyone else out as well!",
        hideCancel: false,
      }
    }else{
      ctrl.metadata = {
        host: false,
        btnLabel: "Leave Room",
        modalTitle: "Leave Room?",
        modalBody: "",
        hideCancel: false,
      }
    }
  }

  ctrl.open = function (size) {
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
      if(scopeSharer.getParentScope()){
        scopeSharer.getParentScope().postModal();
      }
    }, function () {
      
    });
  };

  ctrl.kicked = function(size){
    ctrl.metadata = {
      host: true,
      btnLabel: "Leave Room",
      modalTitle: "Room Closed",
      modalBody: "The host closed this room.",
      hideCancel: true,
    };

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
      if(scopeSharer.getParentScope()){
        scopeSharer.getParentScope().postModal();
      }
    }, function () {
      scopeSharer.getParentScope().postModal();
    });
  }
}]);