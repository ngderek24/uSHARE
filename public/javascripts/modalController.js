var app = angular.module('ushare');

app.controller('modalInstanceCtrl', ['$scope', "$uibModalInstance", 'modalData', function ($scope, $uibModalInstance, modalData) {
  $scope.modalData = modalData;

  $scope.ok = function () {
    $uibModalInstance.close();
  };

  $scope.cancel = function () {
    $uibModalInstance.dismiss('cancel');
  };
}]);

app.controller('modalController', ['$uibModal', 'scopeSharer', function ($uibModal, scopeSharer) {
  var ctrl = this;

  var closeModal = {
    host: true,
    btnLabel: "Close Room",
    modalTitle: "Close Room?",
    modalBody: "Clicking ok will kick everyone else out as well!",
    hideCancel: false,
  };

  var leaveModal = {
    host: false,
    btnLabel: "Leave Room",
    modalTitle: "Leave Room?",
    modalBody: "",
    hideCancel: false,
  };

  var kickedModal = {
    host: true,
    btnLabel: "Leave Room",
    modalTitle: "Room Closed",
    modalBody: "The host closed this room.",
    hideCancel: true,
  };

  ctrl.animationsEnabled = true;

  ctrl.initModal = function(metadata){
    scopeSharer.setChildScope(this);

    if(metadata.role == "host"){
      ctrl.modalData = closeModal;
    }else{
      ctrl.modalData = leaveModal;
    }
  }

  ctrl.open = function (size) {
    var modalInstance = $uibModal.open({
      animation: ctrl.animationsEnabled,
      templateUrl: '/partials/modal',
      controller: 'modalInstanceCtrl',
      size: size,
      resolve: {
        modalData: function () {
          return ctrl.modalData;
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
    ctrl.modalData = kickedModal;

    var modalInstance = $uibModal.open({
      animation: ctrl.animationsEnabled,
      templateUrl: '/partials/modal',
      controller: 'modalInstanceCtrl',
      size: size,
      resolve: {
        modalData: function () {
          return ctrl.modalData;
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