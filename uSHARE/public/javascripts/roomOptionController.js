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
  }

  $scope.choosePlaylist = function(roomName, playlistId, isPrivate, accessCode) {
    $window.location.href = '/playlist/' + roomName + '/' + playlistId + '/' + isPrivate + '/' + accessCode;
  }

  $scope.newPlaylist = function() {
    $window.location.href = '/newPlaylist/' + $scope.newPlaylist.roomName + '/' + $scope.newPlaylist.playlistName + '/' + 
                              $scope.newPlaylist.isPrivate + '/' + $scope.newPlaylist.accessCode;
  }
});