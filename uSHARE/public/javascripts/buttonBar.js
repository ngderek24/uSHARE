// TODO: fix directives organization in relation to module (overwriting problem?)
angular.module("ushare").directive("buttonBar", function(){
	return{
		restrict: 'AE',
		scope: {
			links: "="
		},
		templateUrl: '/partials/buttonBar'
	}
});