angular.module("ushare", []).directive("pageHeader", function(){
	return{
		restrict: 'AE',
		scope: {
			title: "@"
		},
		templateUrl: '/partials/pageHeader'
	}
});