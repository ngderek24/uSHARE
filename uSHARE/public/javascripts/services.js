var app = angular.module('ushare');
app.service('scopeSharer', function(){
	var scope = null;

	return{
		getScope: function(){
			return scope;
		},
		setScope: function(value){
			scope = value;
		}
	};
});