angular.module("ushare", []).directive("titleLarge", function(){
	return{
		restrict: 'AE',
		scope: {
			title: "@"
		},
		templateUrl: 'partials/test'
	}
});