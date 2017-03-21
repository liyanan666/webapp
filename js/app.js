"use strict";


angular.module('app',['ui.router']);
//控制器


//主页控制器
angular.module('app').controller('mainCtrl', ['$http', '$scope', function($http, $scope){
  $http.get('data/positionList.json').success(function(resp){
  //	console.log(resp)
    $scope.list = resp;
  });
}]);
//position控制器

angular.module('app').controller('positionCtrl',['$log', '$q', '$http', '$state', '$scope', 'cache',function($log, $q, $http, $state, $scope, cache){
	$scope.isLogin = !!cache.get('name');
	$scope.message = $scope.isLogin?'投个简历':'去登陆';
	function getPosition(){
		var def = $q.defer();
		
	}
}])

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

//position页指令

angular.module('app').directive('appHeadBar',[function(){
	return {
		restrict : 'A',
		replace :true,
		templateUrl: 'view/template/headBar.html',
		scope:{
			text:'='
		},
		link:function($scope){
			$scope.back = function(){
				window.history.back();
			};
		}
	};
}]);

angular.module('app').directive('appPositionInfo',['$http',function($http){
	return {
		restrict : 'A',
		replace :true,
		templateUrl: 'view/template/positionInfo.html',
		scope:{
			isLogin:'=',
			pos:'=',
			isActive:'='
		},
		link:function($scope){
			$scope.$watch('pos',function(newVal){
					if(newVal){
						$scope.pos.select = $scope.pos.select || false;
						 $scope.imagePath = $scope.pos.select?'image/star-active.png':'image/star.png';
					}
			});
			$scope.favorite = function(){
				$http.post('data/favorite.json',{
					id:$scope.pos.id,
					select: !$scope.pos.select
				}).success(function(resp){
					$scope.pos.select = !$scope.pos.select;
          $scope.imagePath = $scope.pos.select?'image/star-active.png':'image/star.png';
				});
				
			};
		}
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
  }).state('position',{
  	url:'/position/:id',
  	templateUrl:'view/position.html',
  	controller:'positionCtrl'
  });
  $urlRouterProvider.otherwise('main');
}])