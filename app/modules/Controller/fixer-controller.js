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