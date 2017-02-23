angular.module('ushare').controller("roomController", ['$scope', 'scopeSharer', function($scope, scopeSharer) {
  $scope.tracks = new Array();
  $scope.role = "";  
  $scope.socket;

  $scope.$watch('metadata', function () {
    $scope.initRoom($scope.metadata);
  });

  $scope.initRoom = function(metadata){
    scopeSharer.setParentScope($scope);
    /*
      Should actually call internal API to fetch playlist tracks here for better accuracy rather than
      having router pass through playlist data
    */
    $scope.role = metadata.role;
    // $scope.role="guest";
    $scope.uid = metadata.uid;
    $scope.rid = metadata.rid;
    $scope.playlist_id = metadata.playlistId;
    $scope.socket = io('http://localhost:3000', { query: "pid=" + $scope.playlist_id });

    $scope.socket.on('test', function(data){
      console.log(data.body);
    })

    $scope.socket.on('playlist_loaded', function (data) {
      $scope.tracks = data.tracks;
      $scope.$apply();
    });

    //When another user did somthing to the playlist
    $scope.socket.on('playlist_changed', function(data){
      if(data.status == "add"){
        console.log("Track " + data.track.id + " was added.");
        $scope.tracks.push(data.track);
        $scope.$apply();
      }
      else{
        for(var i=0; i < $scope.tracks.length; i++){
          if($scope.tracks[i].id == data.track.id){
            $('#' + data.track.id).fadeOut(300, function(){
                console.log("Track " + data.track.id + " was removed.");
                $scope.tracks.splice(i, 1);  
                $scope.$apply();          
            })

            break;
          }          
        }
      }      
    });

    $scope.socket.on('kicked', function(data){
      scopeSharer.getChildScope().kicked();
    })
  }

  $scope.remove = function(id){
    $scope.socket.emit('remove_track', { id: id });
  }

  $scope.add = function(id){
    $scope.socket.emit('add_track', { id: id });
  }

  $scope.postModal = function(){
    //maybe handle failure to close room later on
    if($scope.role == "host"){
      $scope.socket.emit('close_room', { });
      window.location.href = "/closeRoom/" + $scope.rid;
    }
    else{
      window.location.href = "/leaveRoom";
    }
  }
}]);