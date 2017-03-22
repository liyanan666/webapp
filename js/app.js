"use strict";


angular.module('app', ['ui.router','validation','ngCookies']);
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

//配置http
angular.module('app').config(['$provide', function($provide){
  $provide.decorator('$http', ['$delegate', '$q', function($delegate, $q){
    $delegate.post = function(url, data, config) {
      var def = $q.defer();
      $delegate.get(url).success(function(resp) {
        def.resolve(resp);
      }).error(function(err) {
        def.reject(err);
      });
      return {
        success: function(cb){
          def.promise.then(cb);
        },
        error: function(cb) {
          def.promise.then(null, cb);
        }
      }
    }
    return $delegate;
  }]);
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
  }).state('register',{
  	url:'/register',
  	templateUrl:'view/register.html',
 		controller:'registerCtrl'
  }).state('post',{
  	url:'/post',
  	templateUrl:'view/post.html',
  	controller:'postCtrl'
  }).state('favorite',{
  	url:'/favorite',
  	templateUrl:'view/favorite.html',
  	controller:'favoriteCtrl'
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
  	 if($scope.message !== '已投递') {
      if($scope.isLogin) {
        $http.post('data/handle.json', {
          id: $scope.position.id
        }).success(function(resp) {
          $log.info(resp);
          $scope.message = '已投递';
        });
      } else {
        $state.go('login');
      }
    }
  }
}]);

angular.module('app').controller('companyCtrl', ['$http', '$state', '$scope', function($http, $state, $scope){
  $http.get('data/company.json?id='+$state.params.id).success(function(resp){
  	//console.log(resp)
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

angular.module('app').controller('meCtrl',['$scope','cache','$state',function($scope,cache,$state){
	if(cache.get('name')){
		$scope.name = cache.get('name');
		$scope.image = cache.get('image')
	}
	$scope.logout = function(){
		cache.remove('id');
		cache.remove('name');
		cache.remove('image');
		$state.go('main');
	}
}]);

angular.module('app').controller('loginCtrl',['$state','cache','$http','$scope',function($state,cache,$http,$scope){
	$scope.submit = function() {
    $http.post('data/login.json', $scope.user).success(function(resp){
      cache.put('id',resp.id);
      cache.put('name',resp.name);
      cache.put('image',resp.image);
      $state.go('main');
    });
  }
}]);

angular.module('app').controller('registerCtrl',['$state','$interval','$http','$scope',function($state,$interval,$http,$scope){
	$scope.submit = function(){
		$http.post('data/regist.json',$scope.user).success(function(resp){
			$state.go('login');
		});
	}
	var count = 60;
	$scope.send = function(){
		$http.get('data/code.json').success(function(resp){
			if(1==resp.state){
				count = 60;
				$scope.time = '60s';
				var interval = $interval(function(){
					if(count<=0){
						$interval.cancel(interval);
						$scope.time = '';
					}else{
						count--;
						$scope.time = ''+count+'s';
					}
				},1000);
			}
		})
	}
}]);

angular.module('app').controller('postCtrl',['$scope','$http',function($scope,$http){
	$scope.tabList = [{
    id: 'all',
    name: '全部'
  }, {
    id: 'pass',
    name: '面试邀请'
  }, {
    id: 'fail',
    name: '不合适'
  }];
  $http.get('data/myPost.json').success(function(res){
    $scope.positionList = res;
  });
  $scope.filterObj = {};
  $scope.tClick = function(id, name) {
    switch (id) {
      case 'all':
        delete $scope.filterObj.state;
        break;
      case 'pass':
        $scope.filterObj.state = '1';
        break;
      case 'fail':
        $scope.filterObj.state = '-1';         
        break;
      default:

    }
  }
}]);

angular.module('app').controller('favoriteCtrl',['$scope','$http',function($scope,$http){
	$http.get('data/myFavorite.json').success(function(resp) {
    $scope.list = resp;
  });
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

//服务
angular.module('app').service('cache', ['$cookies', function($cookies){
    this.put = function(key, value){
      $cookies.put(key, value);
    };
    this.get = function(key) {
      return $cookies.get(key);
    };
    this.remove = function(key) {
      $cookies.remove(key);
    };
}]);