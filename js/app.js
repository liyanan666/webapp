"use strict";


angular.module('app',['ui.router']);
//控制器


//路由
angular.module('app').config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider.state('main', {
    url: '/main',
    templateUrl: 'view/main.html',
    controller : 'mainCtrl'
  }).state('position', {
    url: '/position/:id',
    templateUrl: 'view/position.html',
    controller: 'positionCtrl'
  }).state('company',{
  	url: '/company/:id',
  	templateUrl : 'view/company.html',
  	controller:'companyCtrl'
  });
  $urlRouterProvider.otherwise('main');
}])

//主页控制器
angular.module('app').controller('mainCtrl', ['$http', '$scope', function($http, $scope){
  $http.get('data/positionList.json').success(function(resp){
  //	console.log(resp)
    $scope.list = resp;
  });
}]);
//position控制器
angular.module('app').controller('positionCtrl',['$http','$q','$state','$scope',function($http,$q,$state,$scope){
	$scope.message = $scope.isLogin?'请登录':'投个简历吧'
	 function getPosition(){
	 	var def = $q.defer();
	 	$http.get('data/position.json', {
      params: {
        id: $state.params.id
      }
    }).success(function(resp) {
      $scope.position = resp;
      if(resp.posted) {
        $scope.message = '已投递';
      }
      def.resolve(resp);
    }).error(function(err) {
     	def.reject(err);
    });
    return def.promise;
	 };
	 function getCompany(){
	 	$http.get('data/company.json?id='+$state.params.id).success(function(resp){
      $scope.company = resp;
    });
	 };
	 getPosition().then(function(){
	 		getCompany();
	 });
  $scope.go = function(){//未完待续
  	
  }
}])

angular.module('app').controller('companyCtrl', ['$http', '$state', '$scope', function($http, $state, $scope){
  $http.get('data/company.json?id='+$state.params.id).success(function(resp){
  	console.log(resp)
    $scope.company = resp;
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

//position页指令

angular.module('app').directive('appHeadBar', [function(){
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'view/template/headBar.html',
    scope: {
      text: '@'
    },
    link: function($scope) {
      $scope.back = function() {
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

angular.module('app').directive('appCompany',[function(){
	return {
		restrict : 'A',
		replace : true,
		scope:{
			com:'='
		},
		templateUrl : 'view/template/appcompany.html',
		
	}
}]);

angular.module('app').directive('appPositionClass',[function(){
	return {
		restrict : 'A',
		replace : true,
		scope:{
			com:'='
		},
		templateUrl : 'view/template/positionClass.html',
		link : function($scope){
			$scope.showPositionList = function(index){
				
			}
		}
	}
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

