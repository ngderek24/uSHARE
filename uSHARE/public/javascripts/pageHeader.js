angular.module("ushare", ['ui.bootstrap']).directive("pageHeader", function(){
	return{
		restrict: 'AE',
		scope: {
			title: "@"
		},
		templateUrl: '/partials/pageHeader'
	}
});