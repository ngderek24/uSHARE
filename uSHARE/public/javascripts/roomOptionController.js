angular.module("ushare").controller("roomOptionController", function($scope, $http, $window) {
	$scope.initPlaylistsModal = function(playlists) {
		$scope.playlists = playlists.playlists;
		$scope.playlists.map(function(playlist) {
			playlist.isPrivate = false;
			playlist.accessCode = undefined;
		});
	}

	$scope.choosePlaylist = function(roomName, playlistId, isPrivate, accessCode) {
		$window.location.href = '/playlist/' + roomName + '/' + playlistId + '/' + isPrivate + '/' + accessCode;
	}
});