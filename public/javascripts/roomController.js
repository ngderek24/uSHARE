angular.module('ushare').controller("roomController", ['$scope', 'scopeSharer', '$http', '$window', function($scope, scopeSharer, $http, $window) {
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
    $scope.host_id = metadata.hostId;
    $scope.playlist_id = metadata.playlistId;
    $scope.accessCode = metadata.accessCode;

    $scope.socket = io('http://localhost:3000', { query: "pid=" + $scope.playlist_id 
                                                      + "&hostId=" + $scope.host_id });
    // $scope.socket = io('https://radiant-peak-71546.herokuapp.com', { query: "pid=" + $scope.playlist_id 
    //                                                                         + "&hostId=" + $scope.hostId });

    $scope.socket.emit('get_playlist', {});

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

  $scope.add = function(){
    console.log("HELLO");
    for(var i = 0; i < $scope.suggestedTracks.length; i++){
      if($scope.suggestedTracks[i].artist + ' - ' + $scope.suggestedTracks[i].name == $scope.searchString){
        $scope.socket.emit('add_track', { 
                                          track: $scope.suggestedTracks[i],
                                        });
        break;
      }
    }    
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

  $scope.display_data = new Array();
  $scope.suggestedTracks = new Array();
  $scope.updateSuggestions = function(query){
    $scope.display_data = [];
    $scope.suggestedTracks = [];
    return $http.get('https://api.spotify.com/v1/search?', {
      params: {
        q: encodeURIComponent(query),
        type: "track",
        limit: 10
      }
    }).then(function(response){
      var results = (response.data)['tracks'];

      for(var i = 0; i < results['items'].length; i++){
        $scope.display_data.push(results['items'][i]['artists'][0]['name'] + " - " + results['items'][i]['name']);
        $scope.suggestedTracks.push({'id': results['items'][i]['id'],
                                    'name': results['items'][i]['name'],
                                    'artist': results['items'][i]['artists'][0]['name']});
      }

      return $scope.display_data;
    })
  }

  function arrayObjectIndexOf(arr, obj){
    for(var i = 0; i < arr.length; i++){
        if(angular.equals(arr[i], obj)){
            return i;
        }
    };
    return -1;
  }

}]);