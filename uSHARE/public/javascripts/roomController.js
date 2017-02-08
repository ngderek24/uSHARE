angular.module("ushare").controller("roomController", function($scope, $http, $window) {
  $scope.tracks = new Array();
  $scope.role = "";
  $scope.socket = io('http://localhost:3000');

  $scope.initRoom = function(tracks, role){
    /*
      Should actually call internal API to fetch playlist tracks here for better accuracy rather than
      having router pass through playlist data
    */
    $scope.tracks = tracks;
    $scope.role = role;
  }

  $scope.remove = function(id){
    $scope.socket.emit('remove_track', { id: id });

    //REMOVE THIS LATER
    $('#' + id).fadeOut(300, function(){
      $(this).remove();
    })
  }

  $scope.socket.on('room_closed', function (data) {
    
  });

  $scope.socket.on('playlist_changed', function(data){

  });

  $scope.socket.on('removal_result', function(data){
    if(data.success){
      $('#' + id).fadeOut(300, function(){
        $(this).remove();
      })
    }
    else{
      //error handling
    }
  });
});