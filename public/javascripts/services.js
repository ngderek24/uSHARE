var app = angular.module('ushare');
app.service('scopeSharer', function(){
	var parentScope = null;
	var childScope = null;

	return{
		getChildScope: function(){
			return childScope;
		},
		setChildScope: function(value){
			childScope = value;
		},
		getParentScope: function(){
			return parentScope;
		},
		setParentScope: function(value){
			parentScope = value;
		},
	};
});