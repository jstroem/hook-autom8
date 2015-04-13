angular.module('autom8').controller('HooksFormController', ['$scope', function($scope){

	$scope.rules = [];
	$scope.addRule = function(){
		$scope.rules.push({
			type: 'header',
			key: '',
			value: ''
		});
	};

	$scope.removeRule = function(index){
		$scope.rules.splice(index, 1);
	};
	
}]);