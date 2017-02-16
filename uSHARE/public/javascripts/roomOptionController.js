angular.module("ushare").controller("roomOptionController", function($scope, $http, $window) {
  $scope.newPlaylist;

  $scope.initPlaylistsModal = function(playlists) {
    $scope.playlists = playlists.playlists;
    $scope.playlists.map(function(playlist) {
      playlist.isPrivate = false;
      playlist.accessCode = undefined;
    });

    $scope.newPlaylist.roomName = undefined;
    $scope.newPlaylist.playlistName = undefined;
    $scope.newPlaylist.isPrivate = false;
    $scope.newPlaylist.accessCode = undefined;
    $scope.newPlaylist.roomNameNeeded = false;
    $scope.newPlaylist.playlistNameNeeded = false;
    $scope.newPlaylist.accessCodeNeeded = false;
  }

  $scope.choosePlaylist = function(roomName, playlistId, isPrivate, accessCode) {
    if (roomName == undefined || roomName == "") {
      for (var i in $scope.playlists) {
        if ($scope.playlists[i].id == playlistId) {
          $scope.playlists[i].roomNameNeeded = true;
          return;
        }
      }
    }
    
    $window.location.href = '/playlist/' + roomName + '/' + playlistId + '/' + isPrivate + '/' + accessCode;
  }

  $scope.newPlaylist = function() {
    if ($scope.newPlaylist.roomName == undefined || $scope.newPlaylist.roomName == "") {
      $scope.newPlaylist.roomNameNeeded = true;
      return;
    }

    if ($scope.newPlaylist.playlistName == undefined || $scope.newPlaylist.playlistName == "") {
      $scope.newPlaylist.playlistNameNeeded = true;
      return;
    }

    $window.location.href = '/newPlaylist/' + $scope.newPlaylist.roomName + '/' + $scope.newPlaylist.playlistName + '/' + 
                              $scope.newPlaylist.isPrivate + '/' + $scope.newPlaylist.accessCode;
  }
});