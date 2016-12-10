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