angular.module("ushare").controller("roomController", function($scope, $http, $window) {
  $scope.tracks = new Array();
  $scope.role = "";  
  $scope.socket;

  $scope.initRoom = function(tracks, metadata){
    /*
      Should actually call internal API to fetch playlist tracks here for better accuracy rather than
      having router pass through playlist data
    */
    $scope.tracks = tracks;
    $scope.role = metadata.role;
    $scope.uid = metadata.uid;
    $scope.rid = metadata.rid;

    $scope.socket = io('http://localhost:3000', { query: "uid=" + $scope.uid +
                                                         "&rid=" + $scope.rid });

    $scope.socket.on('room_closed', function (data) {
    
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
  }

  $scope.remove = function(id){
    $scope.socket.emit('remove_track', { id: id });
  }

  $scope.add = function(id){
    $scope.socket.emit('add_track', { id: id });
  }
});