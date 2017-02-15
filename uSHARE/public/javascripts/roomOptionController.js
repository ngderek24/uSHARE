angular.module("ushare").controller("roomOptionController", function($scope, $http, $window) {
	$scope.initPlaylistsModal = function(playlists) {
		$scope.playlists = playlists.playlists;
	}

	$scope.choosePlaylist = function(playlistId) {
		console.log(playlistId);
		$window.location.href = '/playlist/' + playlistId;
	}
});