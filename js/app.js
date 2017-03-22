"use strict";


angular.module('app', ['ui.router','validation']);
//控制器

//定义全局变量
angular.module('app').value('dict', {}).run(['dict', '$http', function(dict, $http){
  $http.get('data/city.json').success(function(resp){
    dict.city = resp;
   // console.log( dict.city)
  });
  $http.get('data/salary.json').success(function(resp){
    dict.salary = resp;
  });
  $http.get('data/scale.json').success(function(resp){
    dict.scale = resp;
  });
}]);

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
  }).state('search',{
  	url: '/search',
  	templateUrl : 'view/search.html',
  	controller : 'searchCtrl'
  }).state('me',{
  	url:'/me',
  	templateUrl:'view/me.html',
  	controller:'meCtrl'
  }).state('login',{
  	url:'/login',
  	templateUrl:'view/login.html',
  	controller:'loginCtrl'
  });
  $urlRouterProvider.otherwise('main');
}]);

//表单提交
angular.module('app').config(['$validationProvider', function($validationProvider) {
  var expression = {
    phone: /^1[\d]{10}$/,
    password: function(value) {
      var str = value + ''
      return str.length > 5;
    },
    required: function(value) {
      return !!value;
    }
  };
  var defaultMsg = {
    phone: {
      success: '',
      error: '必须是11位手机号'
    },
    password: {
      success: '',
      error: '长度至少6位'
    },
    required: {
      success: '',
      error: '不能为空'
    }
  };
  $validationProvider.setExpression(expression).setDefaultMsg(defaultMsg);
}]);

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
}]);

angular.module('app').controller('companyCtrl', ['$http', '$state', '$scope', function($http, $state, $scope){
  $http.get('data/company.json?id='+$state.params.id).success(function(resp){
  	console.log(resp)
    $scope.company = resp;
  });
}]);

angular.module('app').controller('searchCtrl',['dict','$http','$state','$scope',function(dict,$http, $state, $scope){
	$scope.name = '';
	$scope.search = function() {
    $http.get('data/positionList.json?name='+$scope.name).success(function(resp) {
      $scope.positionlist = resp;
    });
  };
  $scope.search();
  $scope.sheet = {};
  $scope.tabList = [{
    id: 'city',
    name: '城市'
  }, {
    id: 'salary',
    name: '薪水'
  }, {
    id: 'scale',
    name: '公司规模'
  }];
  $scope.filterObj = {};
  var tabId = '';
  $scope.tClick = function(id,name) {
    tabId = id;
    $scope.sheet.list = dict[id];
    $scope.sheet.visible = true;
  };
  $scope.sClick = function(id,name) {
    if(id) {
      angular.forEach($scope.tabList, function(item){
        if(item.id===tabId) {
          item.name = name;
        }
      });
      $scope.filterObj[tabId + 'Id'] = id;
    } else {
      delete $scope.filterObj[tabId + 'Id'];
      angular.forEach($scope.tabList, function(item){
        if(item.id===tabId) {
          switch (item.id) {
            case 'city':
              item.name = '城市';
              break;
            case 'salary':
              item.name = '薪水';
              break;
            case 'scale':
              item.name = '公司规模';
              break;
            default:
          }
        }
      });
    }
  }
}]);

angular.module('app').controller('meCtrl',['$scope',function($scope){
	
}]);

angular.module('app').controller('loginCtrl',['$http','$scope',function($http,$scope){
	
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
				$scope.positionList = $scope.com.positionClass[index].positionList;
				$scope.isActive = index;
			}
			$scope.$watch('com',function(newVal){
				if(newVal){ $scope.showPositionList(0)};
			})
		}
	}
}]);

angular.module('app').directive('appTab',[function(){
	return {
		restrict : 'A',
		replace : true,
		scope:{
			list:'=',
			tabClick: '&'
		},
		templateUrl : 'view/template/apptab.html',
		link : function($scope){
			$scope.click = function(tab){
				$scope.selectId = tab.id;
        $scope.tabClick(tab);
			};
		}
	}
}]);

angular.module('app').directive('appSheet', [function(){
  return {
    restrict: 'A',
    replace: true,
    scope: {
      list: '=',
      visible: '=',
      select: '&'
    },
    templateUrl: 'view/template/appsheet.html'
  };
}]);

//搜索页面

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
}]);

