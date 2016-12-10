angular.module('fixhomeApp').controller('khachhangCtrl', khachhangCtrl)

function khachhangCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope, $cookies) {
	var vm = this;
	vm.show = false;
	vm.select = false;
	$log.info(1);
	var item = {
		taikhoan: null,
		hinhanh: null,
		otp: null,
		diachi: null,
		email: null,
		hoten: null,
		matkhau: null
	};
	vm.cus = $rootScope.cus;
	$scope.data = {
		matkhaucu: null,
		matkhau: null,
		xacnhan: null
	};
	$scope.taikhoan = vm.cus ? vm.cus.taikhoan : "";
	/*$scope.data.matkhaucu = vm.cus ? vm.cus.matkhau : "";*/
	vm.mode = function (st) {
		$state.go(st);
	};

	vm.modelDetail = function (_id) {
		$state.go('khachhang-chitiet', {
			id: _id
		});

	}

	vm.loadkh = function () {
		fixhomeService.getcustomer().then(function (res) {
			vm.customers = res;
		})
	}
	vm.loadkh();
	vm.themkh = function (data) {
		fixhomeService.savecustomer(data).then(function (res) {
			alert(res);
			$state.go('khachhang');
		})
	};

	vm.capnhatkh = function (id, data) {
		item.diachi = data.diachi;
		item.hoten = data.hoten;
		item.taikhoan = data.taikhoan;
		item.email = data.email;
		item.hinhanh = data.hinhanh;
		item.matkhau = data.matkhau;
		item.otp = data.otp;

		fixhomeService.updatecustomer(id, data).then(function (res) {
			alert(res);
			$state.go('khachhang');
		})
	};

	vm.showConfirm = function (ev, data) {
		var confirm = $mdDialog.confirm()
			.title('Bạn có muốn xóa khách hàng này không?')
			.targetEvent(ev)
			.ok('OK')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			vm.xoakh(data);
			fixhomeService.getcustomer().then(function (res) {
				vm.customers = res;
			});
		}, function () {
			$scope.status = 'You decided to keep your debt.';
		});
	};

	$scope.thaydoimatkhau = function (ev) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: khachhangCtrl,
				controllerAs: "vm",
				templateUrl: 'views/khachhang-table-taikhoan.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
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

	$scope.taomatkhau = function (ev) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: khachhangCtrl,
				controllerAs: "vm",
				templateUrl: 'views/khachhang-taotaikhoan.html',
				parent: angular.element(document.body),
				targetEvent: ev,
				clickOutsideToClose: true,
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

	vm.showthaydoimatkhau = function (cus) {
		$rootScope.cus = cus;
		$scope.thaydoimatkhau();
	};

	vm.showtaomatkhau = function (cus) {
		$rootScope.cus = cus;
		$scope.taomatkhau();
	};

	vm.luumatkhau = function (type, data, id) {
		/*thay doi mat khau*/
		if (type) {
			if (vm.cus.matkhau !== data.matkhaucu) {
				$scope.message = "Vui lòng kiểm tra lại mật khẩu!"
				vm.show = true;
			} else {
				item.taikhoan = vm.cus.taikhoan;
				item.matkhau = data.matkhau;
				item.diachi = vm.cus.diachi;
				item.hoten = vm.cus.hoten;
				item.email = vm.cus.email;
				item.hinhanh = vm.cus.hinhanh;
				item.otp = vm.cus.otp;
				fixhomeService.updatecustomer(id, item).then(function (res) {
					alert(res);
					$scope.cancel();
				})
			}
		} else {
			item.taikhoan = vm.cus.taikhoan;
			item.matkhau = data.matkhau;
			item.diachi = vm.cus.diachi;
			item.hoten = vm.cus.hoten;
			item.email = vm.cus.email;
			item.hinhanh = vm.cus.hinhanh;
			item.otp = vm.cus.otp;
			fixhomeService.updatecustomer(id, item).then(function (res) {
				alert(res);
				$scope.cancel();
			})
		}
		$state('khachhang');
	};

	vm.cancelkh = function () {
		$mdDialog.cancel();
	};

	$scope.hide = function () {
		$mdDialog.hide();
	};
	$scope.cancel = function () {
		$mdDialog.cancel();
	};

	vm.xoakh = function (id) {
		fixhomeService.deletecustomer(id).then(function (res) {})
	};

	if ($state.current.name === "khachhang-chitiet") {
		fixhomeService.getcustomerbyId($state.params.id).then(function (response) {
			vm.kh = response;
		})
	};
};