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

angular.module('fixhomeApp')
	.controller('nhanvienCtrl', nhanvienCtrl);

function nhanvienCtrl($state, $mdDialog, fixhomeService, $http, $scope, $log, $rootScope, $cookies, $mdMedia, fileReader) {
	var vm = this;
	vm.selected = [];
	vm.tho = [];
	vm.condition = {
		'hoten': '',
		'sotruong': [],
		'ngaylam': null,
		'giobd': null,
		'giokt': null
	};

	vm.user = $cookies.getObject('user');
	vm.khuvuc = ["Trung tâm", "Đông", "Tây", "Nam", "Bắc"];

	vm.query = {
		order: 'cmnd',
		limit: 5,
		page: 1
	}

	if (!$rootScope.user) {
		$state.go('login');
	}
	vm.calendarView = "week";
	vm.calendarDate = new Date();
	vm.calendarTitle = ""
	vm.calendarData = [];
	vm.quans = [];
	vm.checktab = true;

	vm.thang = new Date().getMonth();
	vm.nam = new Date().getFullYear();

	vm.tinhluong = function () {
		fixhomeService.salaryFixers(vm.thang, vm.nam).then(function (res1) {
			vm.tho = res1;
			$log.info(vm.tho);
		})

		fixhomeService.salaryOfficers(vm.thang, vm.nam).then(function (res) {
			vm.nhanvienvp = res;
			$log.info(vm.nhanvienvp);
		})
	}

	fixhomeService.getNewFixer().then(function (response) {
		vm.thomoi = response;
	})

	vm.tinhluong();

	$scope.$watchGroup(['vm.calendarView', 'vm.calendarDate', 'vm.checktab'], function (value) {
		if (!value[0] && !value[1])
			return;
		var currentDate = angular.copy(value[1]);
		var first = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
		var last = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
		$log.info("first: " + first + " last: " + last);
	})


	vm.setPage = function () {
		vm.requestList = vm.tho.slice((vm.query.page - 1) * vm.query.limit, vm.query.page * vm.query.limit);
	}

	vm.modelDetail = function (item) {
		$state.go('nhanvien-detail', {
			cmnd: item
		});
	}

	vm.modelNVVPDetail = function (item) {
		$state.go('nhanvienvp-detail', {
			cmnd: item
		});
	}

	vm.modelCalendar = function (item) {
		$state.go('nhanvien-calendar', {
			cmnd: item
		});
	}

	fixhomeService.getSkill().then(function (response) {
		vm.dsdv = response;
	});

	fixhomeService.getDistrict().then(function (response) {
		vm.quans = response;
	})

	vm.modelNew = function () {
		$state.go('nhanvien-new');
	}

	vm.modelNVVPNew = function () {
		$state.go('nhanvienvp-new');
	}

	vm.showConfirm = function (ev, data) {
		var confirm = $mdDialog.confirm()
			.title('Bạn có muốn xóa nhân viên này không?')
			.targetEvent(ev)
			.ok('OK')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			vm.xoanv(data);
			/*fixhomeService.loadListFixer().then(function (response) {
				vm.tho = response;
				vm.setPage();
			});*/
		}, function () {
			$scope.status = 'You decided to keep your debt.';
		});
	};

	vm.showConfirmvp = function (ev, data) {
		var confirm = $mdDialog.confirm()
			.title('Bạn có muốn xóa nhân viên này không?')
			.targetEvent(ev)
			.ok('OK')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			vm.xoanvvp(data);
			/*fixhomeService.loadListFixer().then(function (response) {
				vm.tho = response;
				vm.setPage();
			});*/
		}, function () {
			$scope.status = 'You decided to keep your debt.';
		});
	};

	vm.search = function () {
		vm.condition.sotruong = vm.selected;
		fixhomeService.searchFixer(vm.condition).then(function (response) {
			$log.info(response);
			vm.tho = response;

			/*vm.requestList = response;*/
		})
	}

	if ($state.current.name === "nhanvien-detail") {
		fixhomeService.getFixerbyID($state.params.cmnd).then(function (response) {
			vm.edit = true;
			$log.info(response);
			vm.nv = response;
			vm.nv.ngaysinh = new Date(moment(vm.nv.ngaysinh).format('YYYY-MM-DD'));
		})
	}

	if ($state.current.name === "nhanvienvp-detail") {
		fixhomeService.getOfficerbyID($state.params.cmnd).then(function (response) {
			vm.edit = true;
			$log.info(response);
			vm.nvvp = response;
			vm.nvvp.ngaysinh = new Date(moment(vm.nvvp.ngaysinh).format('YYYY-MM-DD'));
		})
	}

	/*fixhomeService.loadListFixer().then(function (response) {
		vm.tho = response;
	})

	fixhomeService.loadListOfficer().then(function (response) {
		vm.nhanvienvp = response;
	})*/

	vm.themnv = function () {
		fixhomeService.saveFixer($scope.data).then(function (response) {
			$log.info(response);
		})
		vm.message = "Thêm thành công!";
		vm.edit = true;
		vm.modelDetail($scope.data.cmnd);
	}

	vm.themnvvp = function () {
		fixhomeService.saveOfficer($scope.data).then(function (response) {
			$log.info(response);
		})
		vm.message = "Thêm thành công!";
		vm.edit = true;
		vm.modelNVVPDetail($scope.data.cmnd);
	}

	vm.capnhatnv = function () {
		$log.info(vm.nv);
		fixhomeService.updateFixer(vm.nv).then(function (response) {
			$log.info(response);
			alert(response);
			vm.message = response;
		});
		vm.edit = true;
		vm.modelDetail(vm.nv.cmnd);
	}

	vm.capnhatnvvp = function () {
		$log.info(vm.nv);
		fixhomeService.updateOfficer(vm.nvvp).then(function (response) {
			$log.info(response);
			alert(response);
			vm.message = response;
		});
		vm.edit = true;
		vm.modelNVVPDetail(vm.nvvp.cmnd);
	}

	vm.xoanv = function (cmnd) {
		fixhomeService.deleteFixerbyID(cmnd).then(function (response) {
			$log.info(response);
		})
		fixhomeService.loadListFixer().then(function (response) {
			vm.tho = response;
			/*$state.go('nhanvien');*/
		})
	}

	vm.xoanvvp = function (cmnd) {
		fixhomeService.deleteOfficer(cmnd).then(function (response) {
			$log.info(response);
		})
		fixhomeService.loadListOfficer().then(function (response) {
			vm.tho = response;
			$state.go('nhanvien');
		})
	}

	$scope.toggle = function (item, list) {
		var idx = list.indexOf(item);
		if (idx > -1) {
			vm.selected.splice(idx, 1);
		} else {
			vm.selected.push(item);
		}
	};

	$scope.getFile = function () {
		fileReader.readAsDataUrl($scope.file, $scope)
			.then(function (result) {
				$log.info('path: ' + $scope.file.getTrustedResourceUrl);
				$scope.imageSrc = result;
				$log.info('image: ' + $scope.imageSrc);
			});
	};

	vm.dklichban = function (item) {
		$state.go('nhanvien-lichban', {
			cmnd: item
		});
	}

	vm.select = $rootScope.select ? $rootScope.select : 1;

	vm.sendmail = function (data) {
		fixhomeService.sendMail(data).then(function (res) {
			alert(res);
		})
	}

	/*TÀI KHOẢN*/
	$scope.showgdthaydoimatkhau = function (ev, nv) {
		$rootScope.nv = nv;
		$rootScope.isAdd = false;
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: taikhoanCtrl,
				controllerAs: "vm",
				templateUrl: 'views/nhanvien-capnhat-taikhoan.html',
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

	$scope.showgdtaomatkhau = function (ev, nv) {
		$rootScope.nv = nv;
		$rootScope.isAdd = true;
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: taikhoanCtrl,
				controllerAs: "vm",
				templateUrl: 'views/nhanvien-them-taikhoan.html',
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

	$scope.showlich = function (ev, nv) {
		$rootScope.nv = nv;
		$rootScope.isAdd = true;
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: taikhoanCtrl,
				controllerAs: "vm",
				templateUrl: 'views/nhanvien-lich.html',
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

};

angular.module('fixhomeApp').controller('taikhoanCtrl', taikhoanCtrl);

function taikhoanCtrl($state, $mdDialog, fixhomeService, $log, $scope, $window, $mdMedia, $rootScope, $filter, $http, $q, $timeout, moment, calendarConfig) {
	vm = this;

	vm.modelDetail = function (item) {
		$state.go('nhanvien-detail', {
			cmnd: item
		});
	}

	vm.modelNVVPDetail = function (item) {
		$state.go('nhanvienvp-detail', {
			cmnd: item
		});
	}

	vm.show = false;
	$scope.nv = $rootScope.nv ? $rootScope.nv : null;
	$scope.nv.ngaysinh = new Date($scope.nv.ngaysinh);

	for (var i = 0; i < $scope.nv.yeucau && $scope.nv.yeucau.length; i++) {
		var yckh = $scope.nv.yeucau[i];
		yckh.ngaylam = new Date(yckh.ngaylam);
		yckh.giobd = new Date(yckh.giobd);
		yckh.giokt = new Date(yckh.giokt);

		$scope.nv.yeucau[i] = yckh;
	}

	for (var i = 0; i < $scope.nv.xacnhan && $scope.nv.lichnghi.length && $scope.nv.lichnghi; i++) {
		var n = $scope.nv.lichnghi[i];
		n.ngaylam = new Date(n.ngay);
		n.giobd = new Date(n.giobd);
		n.giokt = new Date(n.giokt);
	}

	$scope.isAdd = $rootScope.isAdd;

	$scope.capnhatmatkhau = function () {
		if ($scope.oldPass !== $scope.nv.account.passwork) {
			vm.show = true;
			$scope.message = "Mật khẩu không đúng vui lòng nhập lại!!";
		} else
		if ($scope.newPass !== $scope.renewPass) {
			vm.show = false;
		} else {
			vm.show = false;
			var account = {
				cmnd: $scope.nv.cmnd,
				passwork: $scope.newPass,
				quyen: $scope.nv.account.quyen
			}

			fixhomeService.updateAccount(account).then(function (res) {
				$state.go('nhanvien');
				$scope.hide();
				alert(res);
				$rootScope.select = 3;
				$window.location.reload();
			})
		}
	}

	function password_generator() {
		var length = 8;
		var string = "abcdefghijklmnopqrstuvwxyz"; //to upper 
		var numeric = '0123456789';
		var punctuation = '!@#$%^&*()_+~`|}{[]\:;?><,./-=';
		var password = "";
		var character = "";
		var crunch = true;
		while (password.length < length) {
			entity1 = Math.ceil(string.length * Math.random() * Math.random());
			entity2 = Math.ceil(numeric.length * Math.random() * Math.random());
			entity3 = Math.ceil(punctuation.length * Math.random() * Math.random());
			hold = string.charAt(entity1);
			hold = (entity1 % 2 == 0) ? (hold.toUpperCase()) : (hold);
			character += hold;
			character += numeric.charAt(entity2);
			character += punctuation.charAt(entity3);
			password = character;
		}
		return password;
	}

	var slug = $scope.nv.hoten.toLowerCase();

	//Đổi ký tự có dấu thành không dấu
	slug = slug.replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a');
	slug = slug.replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e');
	slug = slug.replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i');
	slug = slug.replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o');
	slug = slug.replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u');
	slug = slug.replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y');
	slug = slug.replace(/đ/gi, 'd');
	var name = slug.split(" ");
	var username = name[name.length - 1];
	for (var i = 0; i < name.length - 1; i++) {
		username += name[i].charAt(0);
	}
	$scope.nv.ngaysinh = new Date($scope.nv.ngaysinh);
	var dem = $scope.nv.ngaysinh.getDate() + "" + ($scope.nv.ngaysinh.getMonth() + 1);
	username += dem;
	var pass = password_generator();

	$scope.account = {
		cmnd: $scope.nv.cmnd,
		username: username,
		passwork: pass,
		quyen: $scope.nv.sotruong ? 'tho' : 'nhanvienxl',
		email: $scope.nv.email
	}
	$log.info($scope.account);
	$scope.taomatkhau = function () {
		vm.show = false;
		fixhomeService.sendMail($scope.account).then(function (res) {

			if ($scope.nv.sotruong) {
				vm.modelDetail($scope.nv.cmnd);
			} else {
				vm.modelNVVPDetail($scope.nv.cmnd);
			}

			alert("Tạo tài khoản thành công!");
			$scope.hide();
		})

	}

	$scope.hide = function () {
		$mdDialog.hide();
	};
	$scope.cancel = function () {
		$mdDialog.cancel();
	};


}


angular.module('fixhomeApp').controller('lichbanthoCtrl', lichbanthoCtrl);

function lichbanthoCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope, $filter, $http, $q, $timeout, moment, calendarConfig) {
	var vm = this;
	vm.detail = false;
	vm.ngaynghi = $rootScope.ngaynghi ? new Date($rootScope.ngaynghi) : undefined;
	var cmnd = $state.params.cmnd;
	vm.isTho;
	fixhomeService.getFixerbyID(cmnd).then(function (response) {
		if (response !== "") {
			vm.nv = response;
			vm.isTho = true;
			vm.nv.ngaysinh = new Date(moment(vm.nv.ngaysinh).format('YYYY-MM-DD'));
		} else {
			fixhomeService.getOfficerbyID(cmnd).then(function (resNV) {
				vm.nv = resNV;
				vm.isTho = false;
				vm.nv.ngaysinh = new Date(moment(vm.nv.ngaysinh).format('YYYY-MM-DD'));
			})
		}
	})

	$scope.showAdvanced = function (ev) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: lichbanthoCtrl,
				controllerAs: "vm",
				templateUrl: 'views/nhanvien-dangkylichnghi.html',
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

	vm.dklichnghi = function (day) {
		if (vm.calendarView === 'month' && !vm.cellIsOpen) {
			$rootScope.ngaynghi = day;
			$scope.showAdvanced();
		}
	}

	vm.value = {
		cmnd: null,
		ngay: null,
		giobd: null,
		giokt: null
	}

	if (!vm.isTho) {
		vm.thoigian = "Cả ngày";
	}
	vm.luulichnghitho = function () {
		vm.value.cmnd = $state.params.cmnd;
		vm.value.ngay = vm.ngaynghi.getDate() + '/' + (vm.ngaynghi.getMonth() + 1) + '/' + vm.ngaynghi.getFullYear();
		if (vm.thoigian === "Buổi sáng") {
			vm.value.giobd = 360; //6:00
			vm.value.giokt = 720; //12:00
		} else
		if (vm.thoigian === "Buổi chiều") {
			vm.value.giobd = 720; //12:00
			vm.value.giokt = 1200; //22:00
		} else {
			vm.value.giobd = 360;
			vm.value.giokt = 1200;
		}

		fixhomeService.saveDayOfFixer(vm.value).then(function (res) {
			alert(res);
			$scope.cancel();
			vm.loadEvents();
		})
	}

	$scope.hide = function () {
		$mdDialog.hide();
	};
	$scope.cancel = function () {
		$mdDialog.cancel();
	};

	vm.modeDetail = function (_id) {
		vm.yc = undefined;
		vm.edit = true;
		$state.go('yeucau-chitiet', {
			id: _id
		});
	}

	vm.calendarView = 'month';
	vm.viewDate = new Date();


	vm.loadEvents = function () {
		vm.events = [];
		fixhomeService.requestOfFixer($state.params.cmnd).then(function (res) {
			for (var i = 0; i < res.length; i++) {
				var type, name, obj;
				if (res[i].trangthai === "Bắt đầu") type = calendarConfig.colorTypes.info;
				if (res[i].trangthai === "Đang thực hiện") type = calendarConfig.colorTypes.important;
				if (res[i].trangthai === "Kết thúc") type = calendarConfig.colorTypes.success;

				var bd = res[i].giobatdau.getHours() + ":" + res[i].giobatdau.getMinutes();
				var kt = res[i].gioketthuc.getHours() + ":" + res[i].gioketthuc.getMinutes();

				name = res[i].hotenKH + "-" + res[i].dichvuyc.toString() + "(" + bd + "-" + kt + ")";
				obj = {
					color: type,
					title: name,
					startsAt: res[i].giobatdau,
					endsAt: res[i].gioketthuc,
					mayc: res[i]._id
				};
				vm.events.push(obj);
			}
			debugger
		})

		fixhomeService.getDayOfFixerbyId($state.params.cmnd).then(function (response) {
			for (var i = 0; i < response.length; i++) {
				var type1;
				var obj1;
				type1 = calendarConfig.colorTypes.inverse;

				obj1 = {
					color: type1,
					title: "Nghỉ",
					startsAt: response[i].giobatdau,
					endsAt: response[i].gioketthuc
				};
				vm.events.push(obj1);
			}
		})
	}
	vm.loadEvents();
	vm.cellIsOpen = true;

	vm.eventClicked = function (event) {
		alert('Clicked', event);
	};

	vm.eventEdited = function (event) {
		alert('Edited', event);
	};

	vm.eventDeleted = function (event) {
		alert('Deleted', event);
	};

	vm.eventTimesChanged = function (event) {
		alert('Dropped or resized', event);
	};

	vm.toggle = function ($event, field, event) {
		$event.preventDefault();
		$event.stopPropagation();
		event[field] = !event[field];
	};

	vm.timespanClicked = function (date, cell) {
		if (vm.calendarView === 'month') {
			if ((vm.cellIsOpen && moment(date).startOf('day').isSame(moment(vm.viewDate).startOf('day'))) || cell.events.length === 0 || !cell.inMonth) {
				vm.cellIsOpen = false;
			} else {
				vm.cellIsOpen = true;
				vm.viewDate = date;
			}
		} else if (vm.calendarView === 'year') {
			if ((vm.cellIsOpen && moment(date).startOf('month').isSame(moment(vm.viewDate).startOf('month'))) || cell.events.length === 0) {
				vm.cellIsOpen = false;
			} else {
				vm.cellIsOpen = true;
				vm.viewDate = date;
			}
		}

	};

}

angular.module('fixhomeApp')
	.controller('yeuCauCtrl', yeuCauCtrl);

function yeuCauCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope, $cookies, $filter) {
	var vm = this;
	vm.selected = [];
	vm.mayc, vm.giobatdau, vm.gioketthuc;
	vm.edit = $scope.$parent.edit ? $scope.$parent.edit : false;
	vm.yeucau = [];
	vm.quan = [];
	vm.dsdv = [];
	vm.isSave = false;
	vm.condition = $rootScope.condition ? $rootScope.condition : {
		'hoten': '',
		'sotruong': [],
		'ngaylam': '',
		'giobd': null,
		'giokt': null,
		'ngay': null,
		'bd': null,
		'kt': null,
		'quan': ''
	};

	vm.query = {
		order: 'ngaydatyeucau',
		limit: 5,
		page: 1
	}

	vm.trangthai = ["Bắt đầu", "Đang thực hiện", "Kết thúc"];

	if (!$rootScope.user) {
		$state.go('login');
	}

	vm.countMunite = function (time) {
		if (time) {
			var a = time.split(':');
			vm.count = (+a[0]) * 60 + (+a[1]);
		}
	}

	vm.setPage = function () {
		vm.requestList = vm.yeucau.slice((vm.query.page - 1) * vm.query.limit, vm.query.page * vm.query.limit);
	}

	vm.showConfirm = function (ev, data) {
		var confirm = $mdDialog.confirm()
			.title('Bạn có muốn xóa yêu cầu này không?')
			.targetEvent(ev)
			.ok('OK')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			vm.xoayc(data);
			/*fixhomeService.loadListRequest().then(function(response) {
				vm.yeucau = response;
				vm.setPage();
			})
			vm.setPage();*/
			$state.go('yeucau');
		}, function () {
			$scope.status = 'You decided to keep your debt.';
		});
	};

	$scope.toggle = function (item, list) {
		var idx = list.indexOf(item);
		if (idx > -1) {
			vm.selected.splice(idx, 1);
		} else {
			vm.selected.push(item);
		}
	};

	$scope.showAdvanced = function (ev) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: timkiemCtrl,
				templateUrl: 'views/showdanhsachtho.html',
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

	/*vm.search = function() {
		$rootScope.timkiem = [];
		vm.condition.sotruong = vm.selected;
		fixhomeService.searchFixer(vm.condition).then(function(response) {
			$scope.showAdvanced();
			$log.info(response);
			$rootScope.timkiem = response;
		})
	}*/
	vm.search = function () {
		$rootScope.timkiem = [];
		vm.condition.sotruong = vm.selected;
		vm.condition.ngay = vm.ngaylam;
		vm.condition.bd = vm.giobatdau;
		vm.condition.kt = vm.giokt;
		if (vm.condition.ngaylam)
			vm.condition.ngaylam = vm.ngaylam.getDate() + "/" + (vm.ngaylam.getMonth() + 1) + "/" + vm.ngaylam.getFullYear();
		if (vm.condition.giobd)
			vm.condition.giobd = (vm.giobatdau.getHours() * 60) + vm.giobatdau.getMinutes();
		if (vm.condition.giokt)
			vm.condition.giokt = (vm.giokt.getHours() * 60) + vm.giokt.getMinutes();
		$rootScope.condition = vm.condition;
		fixhomeService.searchFixer(vm.condition).then(function (response) {
			$log.info(response);
			$scope.showAdvanced();
			$log.info(response);
			$rootScope.timkiem = response;
		})
	}

	fixhomeService.loadListRequest().then(function (response) {
		vm.yeucau = response;
		vm.yeucau.sort(function (a, b) {
			return b.ngaydatyeucau - a.ngaydatyeucau
		});
	})

	fixhomeService.getSkill().then(function (response) {
		vm.dsdv = response;
	})

	fixhomeService.getDistrict().then(function (response) {
		vm.quan = response;
	})
	vm.ngaydatyeucau = new Date();
	vm.themyc = function () {
		vm.yc.hotenTho = vm.hotenTho;
		vm.yc.cmndTho = vm.cmndTho;
		vm.yc.sdtTho = vm.sdtTho;
		vm.yc.ngaydatyeucau = vm.ngaydatyeucau;

		if (vm.isSave) {
			fixhomeService.saveRequest(vm.yc).then(function (response) {
				alert(response);
			});
			$state.go('yeucau');
		}
	}

	vm.capnhatyc = function () {
		vm.yc.ngaydatyeucau = new Date(vm.yc.ngaydatyeucau);
		vm.yc.giobatdau = (vm.yc.giobatdau.getHours() * 60) + vm.yc.giobatdau.getMinutes();
		vm.yc.gioketthuc = (vm.yc.gioketthuc.getHours() * 60) + vm.yc.gioketthuc.getMinutes();
		$log.info(vm.yc);
		if (vm.isSave) {
			fixhomeService.updateRequest(vm.yc).then(function (response) {
				vm.message = response;
				$log.info("Cập nhật thành công!" + vm.giobatdau);
			})
			vm.modelDetail(vm.yc._id);
		}
	}

	vm.capnhattrangthai = function (req, status) {
		req.trangthai = status;
		var dataup = {
			id: req._id,
			trangthai: req.trangthai
		};
		fixhomeService.updateRequestStatus(dataup).then(function (res) {
			$log.info(res);
		})
		if (status === 'Đang thực hiện') {
			req.giobatdau = String((req.giobatdau.getHours() * 60) + req.giobatdau.getMinutes());
			req.gioketthuc = String((req.gioketthuc.getHours() * 60) + req.gioketthuc.getMinutes());
			var dataBusy = {
				mayc: req._id,
				hotenKH: req.hotenKH,
				cmnd: req.cmndTho,
				ngay: req.ngaylam,
				giobd: parseInt(req.giobatdau, 10),
				giokt: (parseInt(req.gioketthuc, 10) + 30)
			}
			fixhomeService.saveBusyRequest(dataBusy).then(function (res) {
				$log.info(res);
			})
		}
	}

	vm.xoayc = function (id) {
		fixhomeService.deleteRequestbyID(id).then(function (response) {
			$log.info(response);
		})
		vm.yeucau = undefined;
		$state.go('yeucau');
	}

	vm.loaddst = true;
	$scope.$watchGroup(['vm.yc.giobatdau', 'vm.yc.gioketthuc', 'vm.yc.dichvuyc'], function (newValue, oldValue) {
		if (newValue[0] && newValue[1] && newValue[2]) {
			var begin = (newValue[0].getHours() * 60) + newValue[0].getMinutes();
			var end = (newValue[1].getHours() * 60) + newValue[1].getMinutes();

			var kq = end - begin;
			if (kq % 60 === 0) {
				vm.isSave = true;
				var phidv = 0;
				for (var i = 0; i < vm.dsdv.length; i++) {
					for (var j = 0; j < newValue[2].length; j++) {
						if (vm.dsdv[i].tenDichVu === vm.yc.dichvuyc[j]) {
							phidv = vm.dsdv[i].phiTheoGio > phidv ? vm.dsdv[i].phiTheoGio : phidv;
						}
					}
				}
				$log.info('pdv: ' + phidv);
				vm.yc.phidichvu = kq * phidv / 60;
				vm.message = "";
				$log.info(vm.yc.phidichvu);
			} else {
				vm.message = 'Khoảng thời gian thự hiện được tính bằng giờ. Vui lòng kiểm tra lại!!';
				vm.isSave = false;
			}
		}
	})

	var checkSkil = function (arr1, arr2) {
		if (!arr2) return false;
		for (var i = 0; i < arr1.length; i++) {
			for (var j = 0; j < arr2.length; j++) {
				if (arr1[i] !== arr2[j]) {
					return false;
				}
			}
		}
		return true;
	}

	vm.loaddst = true;
	$scope.$watchGroup(['vm.yc.giobatdau', 'vm.yc.gioketthuc', 'vm.yc.dichvuyc', 'vm.yc.ngaylam'], function (newValue, oldValue) {

		if (oldValue[0] || oldValue[1] || oldValue[3] || !vm.loaddst) {
			if (newValue[0] !== oldValue[0] || newValue[1] !== oldValue[1] || newValue[3] !== oldValue[3]);
			else if (checkSkil(newValue[2], oldValue[2])) return;
		}

		oldValue[0] = newValue[0];
		oldValue[1] = newValue[1];
		oldValue[2] = newValue[2];
		oldValue[3] = newValue[3];


		if (newValue[0] && newValue[1] && newValue[2] && newValue[3]) {
			vm.loaddst = false;
			vm.condition.sotruong = newValue[2];

			vm.condition.quan = "";
			fixhomeService.getDistrict().then(function (response) {
				vm.quan = response;

				for (var i = 0; i < vm.quan.length; i++) {
					if (vm.quan[i].tenquan === vm.yc.quan) {
						vm.condition.quan = vm.quan[i].tenkhuvuc;
					}
				}

				vm.condition.ngay = newValue[3];
				vm.condition.bd = newValue[0];
				vm.condition.kt = newValue[1];
				if (vm.condition.ngaylam)
					vm.condition.ngaylam = newValue[3].getDate() + "/" + (newValue[3].getMonth() + 1) + "/" + newValue[3].getFullYear();
				if (vm.condition.giobd)
					vm.condition.giobd = (newValue[0].getHours() * 60) + newValue[0].getMinutes();
				if (vm.condition.giokt)
					vm.condition.giokt = (newValue[1].getHours() * 60) + newValue[1].getMinutes();
				fixhomeService.searchFixer(vm.condition).then(function (response) {
					vm.dsttk = response;

					var tho = null;
					for (var i = 0; i < vm.dsttk.length; i++) {
						if (vm.dsttk[i].hoten === vm.yc.hotenTho) {
							tho = vm.dsttk[i];
							break;
						}
					}
					vm.yc.cmndTho = tho.cmnd;
					vm.yc.sdtTho = tho.sodt;
					vm.dsdvt = [];
					vm.quant = tho.diachi.tenkhuvuc;
					vm.dsdvt = [];
					fixhomeService.getSkill().then(function (response1) {
						vm.dsdv = response1;
						for (var i = 0; i < vm.dsdv.length; i++) {
							if (tho.sotruong.indexOf(vm.dsdv[i].tenDichVu) > -1) {
								vm.dsdvt.push(vm.dsdv[i]);
							}
						}
					})
				})
			})
		}
	})
	vm.dsttk = [];
	$scope.$watchGroup(['vm.yc.hotenTho'], function (value) {
		if (value[0] && vm.dsttk.length > 0) {
			$log.info(vm.yc.hotenTho);
			var tho;
			for (var i = 0; i < vm.dsttk.length; i++) {
				if (vm.dsttk[i].hoten === value[0]) {
					tho = vm.dsttk[i];
					break;
				}
			}
			vm.yc.cmndTho = tho.cmnd;
			vm.yc.sdtTho = tho.sodt;
			vm.quant = tho.diachi.tenkhuvuc;
			vm.dsdvt = [];
			fixhomeService.getSkill().then(function (response1) {
				vm.dsdv = response1;
				for (var i = 0; i < vm.dsdv.length; i++) {
					if (tho.sotruong.indexOf(vm.dsdv[i].tenDichVu) > -1) {
						vm.dsdvt.push(vm.dsdv[i]);
					}
				}
			})
		}
	})

	if ($state.current.name === "yeucau-chitiet") {
		fixhomeService.getRequestbyID($state.params.id).then(function (response) {
			$log.info(response);
			vm.edit = true;
			vm.yc = response;

			/*vm.condition.sotruong = vm.yc.dichvuyc;

			vm.condition.quan = "";
			fixhomeService.getDistrict().then(function (response) {
				vm.quan = response;

				for (var i = 0; i < vm.quan.length; i++) {
					if (vm.quan[i].tenquan === vm.yc.quan) {
						vm.condition.quan = vm.quan[i].tenkhuvuc;
					}
				}
				
				vm.condition.ngay = vm.yc.ngaylam;
				vm.condition.bd = vm.yc.giobatdau;
				vm.condition.kt = vm.yc.gioketthuc;
				if (vm.condition.ngaylam)
					vm.condition.ngaylam = vm.yc.ngaylam.getDate() + "/" + (vm.yc.ngaylam.getMonth() + 1) + "/" + vm.yc.ngaylam.getFullYear();
				if (vm.condition.giobd)
					vm.condition.giobd = (vm.yc.giobatdau.getHours() * 60) + vm.yc.giobatdau.getMinutes();
				if (vm.condition.giokt)
					vm.condition.giokt = (vm.yc.gioketthuc.getHours() * 60) + vm.yc.gioketthuc.getMinutes();
				fixhomeService.searchFixer(vm.condition).then(function (response) {
					vm.dsttk = response;

					var tho = null;
					for (var i = 0; i < vm.dsttk.length; i++) {
						if (vm.dsttk[i].hoten === vm.yc.hotenTho) {
							tho = vm.dsttk[i];
							break;
						}
					}
					vm.yc.cmndTho = tho.cmnd;
					vm.yc.sdtTho = tho.sodt;
					vm.dsdvt = [];
					vm.quant = tho.diachi.tenkhuvuc;
					vm.dsdvt = [];
					fixhomeService.getSkill().then(function (response1) {
						vm.dsdv = response1;
						for (var i = 0; i < vm.dsdv.length; i++) {
							if (tho.sotruong.indexOf(vm.dsdv[i].tenDichVu) > -1) {
								vm.dsdvt.push(vm.dsdv[i]);
							}
						}
					})
				})
			})*/

		})
	}

	vm.modelDetail = function (item) {
		vm.yc = undefined;
		vm.edit = true;
		$state.go('yeucau-chitiet', {
			id: item
		});
		fixhomeService.getRequestbyID(item).then(function (response) {
			$log.info(response);
			vm.edit = true;
			vm.yc = response;
		})
	}

	vm.dklichban = function (item) {
		$state.go('nhanvien-lichban', {
			cmnd: item
		});
	}

	vm.modelNew = function (item) {
		$state.go('yeucau-new', {
			cmnd: item
		});
	}

	if ($state.current.name === "yeucau-new") {
		fixhomeService.getFixerbyID($state.params.cmnd).then(function (response) {
			vm.hotenTho = response.hoten;
			vm.cmndTho = response.cmnd;
			vm.sdtTho = response.sodt;
			vm.quant = response.diachi.tenkhuvuc;
			vm.dsdvt = [];
			vm.yc.ngaylam = vm.condition.ngay;
			vm.yc.giobatdau = vm.condition.bd;
			vm.yc.gioketthuc = vm.condition.kt;
			fixhomeService.getSkill().then(function (response1) {
				vm.dsdv = response1;
				for (var i = 0; i < vm.dsdv.length; i++) {
					if (response.sotruong.indexOf(vm.dsdv[i].tenDichVu) > -1) {
						vm.dsdvt.push(vm.dsdv[i]);
					}
				}
			})
		})
	}
};

angular.module('fixhomeApp')
	.controller('timkiemCtrl', timkiemCtrl);

function timkiemCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope, $cookies) {
	var vm = this;
	$scope.timkiem = $rootScope.timkiem;

	if (!$rootScope.user) {
		$state.go('login');
	}

	$scope.modelNew = function (item) {
		$state.go('yeucau-new', {
			cmnd: item
		});
		$scope.hide();
	};

	$scope.hide = function () {
		$mdDialog.hide();
	};
	$scope.cancel = function () {
		$mdDialog.cancel();
	};
};

angular.module('fixhomeApp')
	.controller('loginCtrl', loginCtrl);

function loginCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope, $cookies) {
	var vm = this;
	$rootScope.user;

	$scope.hide = function () {
		$mdDialog.hide();
	};
	$scope.cancel = function () {
		$mdDialog.cancel();
	};


	vm.dangnhap = function () {
		if ($scope.user) {
			fixhomeService.login($scope.user).then(function (response) {
				if (!response) {
					vm.message = "Vui lòng kiểm tra lại Tên đăng nhập và Mật khẩu";
				} else {
					$rootScope.isLogin = true;
					$cookies.putObject('user', response);
					$rootScope.user = response;
					$state.go('home');
				}
			});
		} else {
			vm.message = "Vui lòng kiểm tra lại Tên đăng nhập và Mật khẩu";
		}

	}
};

angular.module('fixhomeApp')
	.controller('caNhanCtrl', caNhanCtrl);

function caNhanCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope) {
	var vm = this;
	vm.select = true;
	vm.khuvuc = ["Trung tâm", "Đông", "Tây", "Nam", "Bắc"];
	vm.trangthai = ["Bắt đầu", "Xác nhận", "Đang thực hiện", "Kết thúc"];
	if (!$rootScope.user) {
		$state.go('login');
	}

	fixhomeService.getSkill().then(function (response) {
		vm.dsdv = response;
	});

	fixhomeService.getDistrict().then(function (response) {
		vm.quans = response;
	})

	fixhomeService.getFixerbyID($rootScope.user.cmnd).then(function (response) {
		vm.tho = response;
		$log.info(vm.tho);
	})

	fixhomeService.requestOfFixer($rootScope.user.cmnd).then(function (response) {
		vm.requests = response;
	})

	vm.modelDetail = function (id) {
		$state.go('canhan-yeucau-chitiet', {
			mayc: id
		});
		fixhomeService.getRequestbyID($state.params.mayc).then(function (response) {
			vm.yc = response;
		})
	}
	if ($state.current.name === "canhan-yeucau-chitiet") {
		fixhomeService.getRequestbyID($state.params.mayc).then(function (response) {
			$log.info(response);
			vm.yc = response;
		})
	}

	$scope.$watchGroup(['vm.yc.giobatdau', 'vm.yc.gioketthuc', 'vm.yc.dichvuyc'], function (value) {
		if (!value[0] || !value[1] || !value[2])
			return;
		var begin = (vm.yc.giobatdau.getHours() * 60) + vm.yc.giobatdau.getMinutes();
		var end = (vm.yc.gioketthuc.getHours() * 60) + vm.yc.gioketthuc.getMinutes();

		var kq = end - begin;
		if (kq % 60 === 0) {
			vm.isSave = true;
			var phidv = 0;
			for (var i = 0; i < vm.dsdv.length; i++) {
				for (var j = 0; j < vm.yc.dichvuyc.length; j++) {
					if (vm.dsdv[i].tenDichVu === vm.yc.dichvuyc[j]) {
						phidv = vm.dsdv[i].phiTheoGio > phidv ? vm.dsdv[i].phiTheoGio : phidv;
					}
				}
			}
			$log.info('pdv: ' + phidv);
			vm.yc.phidichvu = kq * phidv / 60;
			vm.message = "";
			$log.info(vm.yc.phidichvu);
		} else {
			vm.message = 'Khoảng thời gian thự hiện được tính bằng giờ. Vui lòng kiểm tra lại!!';
			vm.isSave = false;
		}
	})

	vm.goHome = function () {
		$state.go('canhan');
	}
	vm.capnhatyc = function () {
		vm.yc.ngaydatyeucau = new Date(vm.yc.ngaydatyeucau);
		vm.yc.giobatdau = (vm.yc.giobatdau.getHours() * 60) + vm.yc.giobatdau.getMinutes();
		vm.yc.gioketthuc = (vm.yc.gioketthuc.getHours() * 60) + vm.yc.gioketthuc.getMinutes();

		$log.info(vm.yc);
		if (vm.isSave) {
			fixhomeService.updateRequest(vm.yc).then(function (response) {
				vm.message = response;
				alert(response);
				$log.info("Cập nhật thành công!" + vm.giobatdau);
			})
			vm.modelDetail(vm.yc._id);
		}
	}

};

angular.module('fixhomeApp').controller('dichvuCtrl', dichvuCtrl)

function dichvuCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope) {
	var vm = this;
	$scope.data = $rootScope.datadv;
	vm.loaddv = function () {
		fixhomeService.getSkill().then(function (response) {
			vm.services = response;
		});
	}
	vm.loaddv();
	vm.modelNew = function () {
		$state.go('dichvu-new');
	}

	$scope.showAdvanced = function (ev) {
		var useFullScreen = ($mdMedia('sm') || $mdMedia('xs')) && $scope.customFullscreen;
		$mdDialog.show({
				controller: dichvuCtrl,
				templateUrl: 'views/dichvu-chitiet.html',
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

	vm.capnhatdichvu = function (ser) {
		$rootScope.datadv = ser;
		$scope.showAdvanced();
	}

	var item = {
		"tenDichVu": null,
		"phiTheoGio": null,
		"mota": null
	};
	$scope.luucapnhatdv = function (ser) {
		item.tenDichVu = ser.tenDichVu;
		item.phiTheoGio = ser.phiTheoGio;
		item.mota = ser.mota;
		fixhomeService.updateSkill(ser._id, item).then(function (res) {
			$scope.hide();
			alert('Cap nhat thanh cong');
		})
	}

	vm.themdv = function (ser) {
		fixhomeService.saveSkill(ser).then(function (res) {
			$state.go('dichvu');
		})
	}

	vm.showConfirm = function (ev, data) {
		var confirm = $mdDialog.confirm()
			.title('Bạn có muốn xóa dịch vụ này không?')
			.targetEvent(ev)
			.ok('OK')
			.cancel('Cancel');
		$mdDialog.show(confirm).then(function () {
			vm.xoadv(data);
			vm.loaddv();
			$state.go('dichvu');
		}, function () {
			$scope.status = 'You decided to keep your debt.';
		});
	};

	vm.xoadv = function (id) {
		fixhomeService.deleteSkill(id).then(function (res) {
			alert("Xóa thành công!");
		})
	}

	vm.canceldv = function () {
		$scope.data = undefined;
	}

	$scope.hide = function () {
		$mdDialog.hide();
	};
	$scope.cancel = function () {
		$mdDialog.cancel();
	};

};

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

angular.module('fixhomeApp').controller('thongkeCtrl', thongkeCtrl)

function thongkeCtrl($state, $mdDialog, fixhomeService, $log, $scope, $mdMedia, $rootScope, $filter, $http, $q, moment, calendarConfig) {
	$scope.labels = ['Sửa điện', 'Sửa nước', 'Sửa chữa các loại'];
	$scope.data = [65, 59, 80];

	$scope.labels1 = ['Sửa điện', 'Sửa nước', 'Sửa chữa các loại'];
	$scope.series = ['Series A'];

	$scope.data1 = [
				[65, 59, 80]
			];

	var vm = this;

	$scope.labels = ['6:00', '7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
	$scope.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

	$scope.chartYeuCau = {};

	$scope.chartYeuCau.type = "PieChart";

	$scope.chartQuan = {};

	$scope.chartQuan.type = "PieChart";

	$scope.chartDate = {};

	$scope.chartDate.type = "ColumnChart";

	$scope.onions = [
		{
			v: "Onions"
		},
		{
			v: 3
		},
    ];

	var date = new Date();
	vm.start = new Date(date.getFullYear(), date.getMonth(), 1);
	vm.end = new Date(date.getFullYear(), date.getMonth() + 1, 0);

	vm.xuly = function () {
		fixhomeService.dashboard(vm.start, vm.end).then(function (res) {
			fixhomeService.getSkill().then(function (response) {
				vm.dsdv = response;

				for (var i = 0; i < vm.dsdv.length; i++) {
					vm.dsdv[i].dem = 0;
				}

				for (var n = 0; n < res.length; n++) {
					for (var l = 0; l < vm.dsdv.length; l++) {
						var dvyc = res[n].dichvuyc;
						if (dvyc.indexOf(vm.dsdv[l].tenDichVu) !== -1) {
							vm.dsdv[l].dem++;
						}
					}
				}

				$scope.chartYeuCau.data = {
					"cols": [
						{
							id: "t",
							label: "Topping",
							type: "string"
						},
						{
							id: "s",
							label: "Slices",
							type: "number"
						}
					],
					"rows": []
				}


				for (var i = 0; i < vm.dsdv.length; i++) {
					var dv = [];
					dv.push({
						"v": vm.dsdv[i].tenDichVu
					});
					dv.push({
						"v": vm.dsdv[i].dem
					});

					$scope.chartYeuCau.data.rows.push({
						"c": dv
					});
				}

			});

			$scope.chartQuan.data = {
				"cols": [
					{
						id: "t",
						label: "Topping",
						type: "string"
						},
					{
						id: "s",
						label: "Slices",
						type: "number"
						}
					],
				"rows": []
			}

			fixhomeService.getDistrict().then(function (response1) {
				vm.quans = response1;
				for (var j = 0; j < vm.quans.length; j++) {
					vm.quans[j].dem = 0;
				}
				for (var z = 0; z < res.length; z++) {
					for (var m = 0; m < vm.quans.length; m++) {
						if (res[z].quan === vm.quans[m].tenquan) {
							vm.quans[m].dem++;
						}
					}
				}
				for (var i = 0; i < vm.quans.length; i++) {
					var q = [];
					q.push({
						"v": vm.quans[i].tenquan
					});
					q.push({
						"v": vm.quans[i].dem
					});

					$scope.chartQuan.data.rows.push({
						"c": q
					});
				}

			})

			var reqOfWeek = [
				{
					date: "Chủ nhật",
					count: 0
				},
				{
					date: "Thứ 2",
					count: 0
				},
				{
					date: "Thứ 3",
					count: 0
				},
				{
					date: "Thứ 4",
					count: 0
				},
				{
					date: "Thứ 5",
					count: 0
				},
				{
					date: "Thứ 6",
					count: 0
				},
				{
					date: "Thứ 7",
					count: 0
				}
			]
			$scope.data = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; //6-20h
			for (var k = 0; k < res.length; k++) {
				var day = res[k].ngaylam.getDay();
				reqOfWeek[day].count++;

				var bd = res[k].giobatdau.getHours();
				var kt = res[k].gioketthuc.getHours();
				for (var q = bd; q <= kt; q++) {
					$scope.data[q - 6]++;
				}
			}

			$scope.chartDate.data = {
				"cols": [
					{
						id: "t",
						label: "Topping",
						type: "string"
					},
					{
						id: "s",
						label: "Yêu cầu",
						type: "number"
					}
    			],
				"rows": []
			};

			for (var g = 0; g < reqOfWeek.length; g++) {
				var dateReq = [];
				dateReq.push({
					"v": reqOfWeek[g].date
				});
				dateReq.push({
					"v": reqOfWeek[g].count
				});

				$scope.chartDate.data.rows.push({
					"c": dateReq
				});
			}

			$scope.chartYeuCau.options = {
				'title': 'Thống kê dịch vụ yêu cầu từ ' + vm.start.getDate() + "/" + (vm.start.getMonth() + 1) + "/" + vm.start.getFullYear() + " đến " + vm.end.getDate() + "/" + (vm.end.getMonth() + 1) + "/" + vm.end.getFullYear()
			};

			$scope.chartDate.options = {
				'title': 'Thống kê yêu cầu theo ngày từ ' + vm.start.getDate() + "/" + (vm.start.getMonth() + 1) + "/" + vm.start.getFullYear() + " đến " + vm.end.getDate() + "/" + (vm.end.getMonth() + 1) + "/" + vm.end.getFullYear()
			};
			$scope.chartQuan.options = {
				'title': 'Thống kê yêu cầu theo quận từ ' + vm.start.getDate() + "/" + (vm.start.getMonth() + 1) + "/" + vm.start.getFullYear() + " đến " + vm.end.getDate() + "/" + (vm.end.getMonth() + 1) + "/" + vm.end.getFullYear()
			};

			$scope.colors = ['#3366cc', '#45b7cd', '#ff6384', '#ff8e72'];
			/*$scope.chartTime = [
				{
					label: "Yêu cầu",
					borderWidth: 3,
					hoverBackgroundColor: "rgba(255,99,132,0.4)",
					hoverBorderColor: "rgba(255,99,132,1)",
					type: 'line'
      			}
			];*/

		})
	}

	vm.xuly();

	$scope.readyHandlerbyService = function (chartWrapper) {
		vm.chartbyService = chartWrapper.getChart().getImageURI();
	}

	$scope.readyHandlerbyDistrict = function (chartWrapper) {
		vm.chartbyDistrict = chartWrapper.getChart().getImageURI();
	}

	$scope.readyHandlerbyDate = function (chartWrapper) {
		vm.chartbyDate = chartWrapper.getChart().getImageURI();
	}

	vm.generatePDF = function () {
		var doc = new jsPDF();
		doc.setFontSize(20);
		doc.text(35, 25, "Thống kê");
		doc.addImage(vm.chartbyService, 'JPEG', 15, 120, 80, 80);
		doc.addImage(vm.chartbyDistrict, 'JPEG', 95, 120, 80, 80);
		doc.addImage(vm.chartbyDate, 'JPEG', 15, 200, 80, 80);

		doc.save('thongke.pdf');
		/*kendo.drawing.drawDOM($("#formConfirmation")).then(function (group) {
			kendo.drawing.pdf.saveAs(group, "exportPDF.pdf");
		});*/
	}

};

angular.module('fixhomeApp').config(function ($mdDateLocaleProvider) {
	$mdDateLocaleProvider.formatDate = function (date) {
		return date ? moment(date).format('DD/MM/YYYY') : '';
	};
});
