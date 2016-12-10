angular.module('fixhomeApp')
	.controller('navBarCtrl', navBarCtrl);

function navBarCtrl($scope, $mdSidenav, $state, $log, $interval, fixhomeService, $mdDialog, $mdMedia, $rootScope, $cookies) {
	var vm = this;
	$rootScope.user = $cookies.getObject('user');

	vm.num = 0;


	$log.info('login: ' + $state.current.name);
	vm.toggleLeft = buildToggler('left');

	vm.isOpenLeft = function () {
		return $mdSidenav('left').isOpen();
	};

	vm.close = function () {
		$mdSidenav('left').close()
			.then(function () {
				$log.debug("close LEFT is done");
			});
	};

	vm.logout = function () {
		$rootScope.user = undefined;
		$scope.user = undefined;
		$cookies.remove('user');
		$rootScope.isLogin = false;
		$state.go('login');
		vm.num = 0;
	}

	if ($rootScope.user) {
		$rootScope.isLogin = true;
		$log.info('user: ' + $rootScope.user);
		$log.info($rootScope.user.username + '- isLogin: ' + $rootScope.isLogin + '- quyen: ' + $rootScope.user.quyen);
		if (window.location.href === "http://localhost:8000/") {
			$state.go('home');
		}
		if ($rootScope.user.quyen === 'tho') {
			$rootScope.isTho = true;
		} else {
			$rootScope.isTho = false;
		}

	}

	function buildToggler(navID) {
		return function () {
			$mdSidenav(navID)
				.toggle()
				.then(function () {
					$log.debug("toggle " + navID + " is done");
				});
		}
	}

	if (!$rootScope.user) {
		$log.info('dk navBar sai')
		$state.go('login');
	}

	$scope.showAdvanced = function (ev) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: loginCtrl,
				templateUrl: 'views/login.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: false,
				fullscreen: useFullScreen
			})
			.then(function (answer) {
				$scope.status = 'You said the information was "' + answer + '".';
			}, function () {
				$scope.status = 'You cancelled the dialog.';
			});
		$scope.$watch(function () {
			return $mdMedia('xs') || $mdMedia('sm');
		}, function (wantsFullScreen) {
			$scope.customFullscreen = (wantsFullScreen === true);
		});
	};
	/*$scope.showAdvanced();*/

	vm.items = [
		{
			'name': 'Yêu cầu khách hàng',
			'state': 'yeucau'
            },
		{
			'name': 'Quản lý nhân viên',
			'state': 'nhanvien'
            },
		{
			'name': 'Quản lý dịch vụ',
			'state': 'dichvu'
			},
		{
			'name': 'Quản lý khách hàng',
			'state': 'khachhang'
			},
		{
			'name': 'Thống kê',
			'state': 'thongke'
			}
        ]

	vm.goState = function (item) {
		if ($rootScope.user.quyen === 'nhanvienxl' && item === 'yeucau')
			$state.go(item);
		if ($rootScope.user.quyen === 'nhanvienkt' && item === 'nhanvien') {
			$state.go(item);
		}
		if ($rootScope.user.quyen === 'quantri' || $rootScope.user.quyen === 'admin') {
			$state.go(item);
		}
	}

	vm.modelRequest = function () {
		if ($rootScope.user.quyen === "tho") {
			$state.go('canhan');
		} else {
			$state.go('yeucau');
		}
	}

	$interval(getNumRequest, 1000);

	function getNumRequest() {
		if ($rootScope.user) {
			if ($rootScope.user.quyen === "tho") {
				fixhomeService.requestOfFixerNew($rootScope.user.cmnd).then(function (response) {
					vm.num = response.length;
				});
			} else if ($rootScope.user.quyen === "admin" || $rootScope.user.quyen === "nhanvienxl" || $rootScope.user.quyen === "quantri") {
				fixhomeService.loadRequestNew().then(function (response) {
					/*$log.info(response);*/
					vm.num = response.length;
				});
			}
		} else {
			vm.num = 0;
		}
	}

};
