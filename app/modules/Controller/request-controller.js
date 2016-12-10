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