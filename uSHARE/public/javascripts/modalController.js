angular.module('ushare').controller('modalController', function ($uibModal, $log, $document) {
  var $ctrl = this;

  $ctrl.animationsEnabled = false;

  $ctrl.open = function (size, parentSelector) {
    var parentElem = parentSelector ? 
      angular.element($document[0].querySelector('.modal-demo ' + parentSelector)) : undefined;
    var modalInstance = $uibModal.open({
      animation: $ctrl.animationsEnabled,
      ariaLabelledBy: 'modal-title',
      ariaDescribedBy: 'modal-body',
      templateUrl: '/partials/modal',
      controller: 'modalController',
      controllerAs: '$ctrl',
      size: size,
      appendTo: parentElem,
      resolve: {
        items: function () {
          return $ctrl.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $ctrl.selected = selectedItem;
    }, function () {
      $ctrl.close();
    });
  };

  $ctrl.close = function(){
    window.location.href = "/promptRoomOption";
  }
});