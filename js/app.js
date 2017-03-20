"use strict";


angular.module('app',['ui.router']);
//控制器

angular.module('app').controller('mainCtrl', ['$http', '$scope', function($http, $scope){
  $http.get('data/positionList.json').success(function(resp){
  	console.log(resp)
    $scope.list = resp;
  });
}]);

//指令
angular.module('app').directive('appHead', [function(){
  return {
    restrict: 'A',
    replace: true,
    scope: {
      com: '='
    },
    templateUrl: 'view/template/head.html'
  };
}]);

angular.module('app').directive('appPositionList', ['$http',function($http){
  return {
    restrict: 'A',
    replace: true,
    scope: {
      data : '=',
      filterObj : '=',
      isFavorite : '='
    },
    templateUrl: 'view/template/apppositionlist.html',
    link:function($scope){
    	$scope.select=function(item){
    		$http.post('data/favorite.json',{
    			id:item.id,
    			select:!item.select,
    		}).success(function(resp){
    			item.select = !item.select;
    		})
    	};
    }
  };
}]);

angular.module('app').directive('appFoot', [function(){
  return {
    restrict: 'A',
    replace: true,
    
    templateUrl: 'view/template/foot.html'
  };
}]);
//过滤器

angular.module('app').filter('filterByObj',[function(){
	
	return function(list,obj){
		var result = [];
		angular.forEach(list,function(item){
			var isEqual = true;
			for(var e in obj){
				if(item[e] !== obj[e]){
					isEqual = false;
				}
			}
			if(isEqual){
				result.push(item);
			}
		});
		return result;
	}
}])

//路由
angular.module('app').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('main', {
    url: '/main',
    templateUrl: 'view/main.html',
    controller : 'mainCtrl'
  });
  $urlRouterProvider.otherwise('main');
}])