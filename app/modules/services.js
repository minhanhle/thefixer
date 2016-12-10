angular.module('fixhomeApp')
	.service('fixhomeService', fixhomeService);

function fixhomeService($http, $log) {
	this.login = function (user) {
		return $http.get('/login?username=' + user.name + '&passwork=' + user.pass).then(function (response) {
			return response.data;
		})
	}

	this.updateAccount = function (account) {
		return $http.put('/user/' + account.cmnd, account).then(
			function successCallback(response) {
				return "Cập nhật thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	/*Fixer*/
	this.loadListFixer = function () {
		return $http.get('/tho').then(function (response) {
			var dstho = response.data;

			return dstho;
		})
	}

	this.getNewFixer = function () {
		return $http.get('/thomoi').then(function (response) {

			return response.data;
		})
	}


	this.saveFixer = function (data) {
		data.xacnhan = false;

		return $http.post('/tho', data).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.updateFixer = function (data) {
		return $http.put('/tho/' + data.cmnd, data).then(
			function successCallback(response) {
				return "Cập nhật thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.getFixerbyID = function (item) {
		return $http.get('/tho/' + item).then(
			function successCallback(response) {
				//response.data.ngaysinh = new Date(response.data.ngaysinh);
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.deleteFixerbyID = function (item) {
		return $http.delete('/tho/' + item).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	function kiemtrathoigian(start, end, bd, kt) {
		if (bd && !kt) {
			if (bd > start && kt < end) return false;
		}
		if (!bd && kt) {
			if (kt > start && kt < end) return false;
		}
		if (start > bd && start < kt) return false;
		if (end < kt && end > start) return false;
		if (start < bd && end < kt && end > start) return false;
		if (start > bd && end > kt && start < kt) return false;
		if (start < bd && end > kt) return false;

		return true;
	}

	function kiemtrasotruong(stkt, sttho) {
		if (stkt.length === 0) return true;
		for (var i = 0; i < stkt.length; i++) {
			var kq = sttho.indexOf(stkt[i]);
			if (kq > -1) {
				return true;
			}
		}
		return false;
	}

	this.searchFixer = function (condition) {
		return $http.get('/timkiemtho?hoten=' + condition.hoten + '&quan=' + condition.quan).then(
			function successCallback(response) {
				var data = response.data;
				if (condition.sotruong.length != 0) {
					for (var i = 0; i < data.length; i++) {
						if (!kiemtrasotruong(condition.sotruong, data[i].sotruong)) {
							data.splice(i, 1);
							i--;
						}
					}
				}
				if (condition.ngaylam) {
					for (var j = 0; j < data.length; j++) {
						$http.get('/lichbanthotheongay?cmnd=' + data[j].cmnd + '&ngay=' + condition.ngaylam).then(function (res1) {
							for (var z = 0; z < res1.length; z++) {
								if (!kiemtrathoigian(condition.giobd, condition.giokt, res1[z].giobd, res1[z].giokt)) {
									data.splice(j, 1);
									break;
								}
							}
						})
					}

					for (var l = 0; l < data.length; l++) {
						$http.get('/lichlamviecthotheongay?cmnd=' + data[l].cmnd + '&ngay=' + condition.ngaylam).then(function (res2) {
							for (var k = 0; k < res2.length; k++) {
								if (!kiemtrathoigian(condition.giobd, condition.giokt, res2[k].giobd, res2[k].giokt)) {
									data.splice(k, 1);
									break;
								}
							}
						})
					}
				}
				return data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.salaryFixers = function (thang, nam) {
			return $http.get('/tho').then(function (res) {
				var fixers = res.data;
				var accounts = [];
				$http.get('user/tho').then(function (resUser) {
					accounts = resUser.data;

					for (var i = 0; i < fixers.length; i++) {
						var tho = fixers[i];
						for (var j = 0; j < accounts.length; j++) {
							if (tho.cmnd === accounts[j].cmnd) {
								tho.account = accounts[j];
								break;
							}
						}
						fixers[i] = tho;
					}
				})

				var ngay = thang + "/" + nam;
				$http.get('/yeucauhoanthanhtheothanng?&ngaylam=' + ngay).then(function (response) {
					for (var i = 0; i < fixers.length; i++) {
						var tho = fixers[i];
						tho.tongGioLam = 0;
						tho.luong = 0;
						var tongGioLam = 0;
						tho.yeucau = [];
						for (var j = 0; j < response.data.length; j++) {
							if (response.data[j].cmndTho === tho.cmnd) {
								var yc = response.data[j];
								tongGioLam += (yc.gioketthuc - yc.giobatdau) / 60;

								var day = yc.ngaylam;
								var part = [];
								if (day) {
									parts = day.split('/');
									yc.ngaylam = new Date(parts[2], parts[1] - 1, parts[0]);

									yc.ngaylam = new Date(yc.ngaylam);
									var bd = findTimebyValue(yc.giobatdau);
									var kt = findTimebyValue(yc.gioketthuc);
									if (yc.gioketthuc) {
										yc.giokt = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + kt);
									}
									if (yc.giobatdau) {
										yc.giobd = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + bd);
									}
									tho.yeucau.push(yc);
								}
							}
							tho.tongGioLam = tongGioLam;
							fixers[i] = tho;
						}

						for (var j = 0; j < fixers.length; j++) {
							fixers[j].luong = fixers[j].tongGioLam * fixers[j].luongtheogio;
						}
					}
				})

				$http.get('/lichnghitheothang?ngay=' + ngay).then(function (resDayOff) {
					for (var l = 0; l < fixers.length; l++) {
						var tho = fixers[l];
						tho.lichnghi = [];

						for (var k = 0; k < resDayOff.data.length; k++) {
							var part = [];
							var lichban = resDayOff.data[k];
							if (lichban.cmnd === tho.cmnd) {
								var day = lichban.ngay;
								if (day) {
									parts = day.split('/');
									lichban.ngay = new Date(parts[2], parts[1] - 1, parts[0]);

									lichban.ngay = new Date(lichban.ngay);
									var bd = findTimebyValue(lichban.giobd);
									var kt = findTimebyValue(lichban.giokt);
									if (lichban.giokt) {
										lichban.giokt = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + kt);
									}
									if (lichban.giobd) {
										lichban.giobd = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + bd);
									}
									tho.lichnghi.push(lichban);
								}
							}
						}
						fixers[l] = tho;
					}

				})

				return fixers;
			})
		}
		/*LỊCH BẬN THỢ*/
	this.saveDayOfFixer = function (value) {
		return $http.post('/lichbantho', value).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			}
		)
	}

	this.getDayOfFixerbyId = function (id) {
		return $http.get('/lichbantho/' + id).then(function (res) {
			for (var j = 0; j < res.data.length; j++) {
				var data = res.data[j];
				var day = data.ngay;
				var parts;
				if (day) {
					var parts = day.split('/');
					/*$log.info(parts+ " - "+data.ngaylam);*/
					data.ngaylam = new Date(parts[2], parts[1] - 1, parts[0]);
				}

				/*data.ngaylam = new Date(moment(data.ngaylam).format('YYYY-MM-DD HH:mm'));*/
				//data.ngaylam = new Date(data.ngaylam);
				data.giobatdau = new Date(moment(parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + findTimebyValue(data.giobd)).format('YYYY-MM-DD HH:mm'));
				data.gioketthuc = new Date(moment(parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + findTimebyValue(data.giokt)).format('YYYY-MM-DD HH:mm'));

				res.data[j] = data;
			}
			return res.data;
		})
	}

	var dsGio = [
		{
			time: "06:00",
			value: 360
					},
		{
			time: "06:30",
			value: 390
					},
		{
			time: "07:00",
			value: 420
					},
		{
			time: "07:30",
			value: 450
					},
		{
			time: "08:00",
			value: 480
					},
		{
			time: "08:30",
			value: 510
					},
		{
			time: "09:00",
			value: 540
					},
		{
			time: "09:30",
			value: 570
					},
		{
			time: "10:00",
			value: 600
					}, {
			time: "10:30",
			value: 630
					}, {
			time: "11:00",
			value: 660
					}, {
			time: "11:30",
			value: 690
					}, {
			time: "12:00",
			value: 720
					}, {
			time: "12:30",
			value: 750
					}, {
			time: "13:00",
			value: 780
					}, {
			time: "13:30",
			value: 810
					}, {
			time: "14:00",
			value: 840
					}, {
			time: "14:30",
			value: 870
					}, {
			time: "15:00",
			value: 900
					}, {
			time: "15:30",
			value: 930
					}, {
			time: "16:00",
			value: 960
					}, {
			time: "16:30",
			value: 990
					}, {
			time: "17:00",
			value: 1020
					}, {
			time: "17:30",
			value: 1050
					}, {
			time: "18:00",
			value: 1080
					}, {
			time: "18:30",
			value: 1110
					}, {
			time: "19:00",
			value: 1140
					}, {
			time: "19:30",
			value: 1170
					}, {
			time: "20:00",
			value: 1200
					}
				];
	var findTimebyValue = function (item) {
		for (var i = 0; i < dsGio.length; i++) {
			if (dsGio[i].value === item) {
				return dsGio[i].time;
			}
		}
	}

	/*SENMAIL*/


	this.sendMail = function (data) {
		var body = {
			mail: data.email,
			sub: "Tài khoản nhân viên",
			content: "<p>Chào bạn, </p></br><p>Tài khoản đăng nhập: " + data.username + "</p></br><p>Mật khẩu: " + data.passwork + "</p></br></br>Hệ thống quản lý người sửa chữa theo giờ. Wellcome :)"
		}

		return $http.post('/user', data).then(function (res) {
			$log.info(res.data);
			$http.post('/sendmail', body).then(
				function successCallback(response) {
					$log.info("Send mail success: " + response.data);

					if (data.quyen === 'tho') {
						var val = {
							xacnhan: true
						};

						$http.put('/tho/' + data.cmnd, val).then(function (resUpdate) {
							return "Tạo tài khoản thành công!"
						})
					} else {
						var val = {
							xacnhan: true,
							ngaybatdaulamviec: new Date()
						};

						$http.put('/nhanvienvanphong/' + data.cmnd, val).then(function (resUpdate) {
							return "Tạo tài khoản thành công!"
						})
					}

				},
				function errorCallback(response) {
					$log.info("Send mail err: " + response.data);
					return "Tên đăng nhập trùng. Vui lòng kiểm tra lại."
				}
			)
		})
	}

	/*NHÂN VIÊN VĂN PHÒNG*/
	this.loadListOfficer = function () {
		return $http.get('/nhanvienvanphong').then(function (response) {
			var data;

			for (var i = 0; i < response.data.length; i++) {
				data = response.data[i];
				data.ngaysinh = new Date(data.ngaysinh);

				response.data[i] = data;
			}
			return response.data;
		})
	}

	this.getOfficerbyID = function (item) {
		return $http.get('/nhanvienvanphong/' + item).then(
			function successCallback(response) {
				//response.data.ngaysinh = new Date(response.data.ngaysinh);
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.saveOfficer = function (data) {
		return $http.post('/nhanvienvanphong', data).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			}
		)
	}

	this.updateOfficer = function (data) {
		return $http.put('/nhanvienvanphong/' + data.cmnd, data).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			}
		)
	}

	this.deleteOfficer = function (cmnd) {
		return $http.delete('/nhanvienvanphong/' + cmnd).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.salaryOfficers = function (thang, nam) {
		return $http.get('/nhanvienvanphong').then(function (response) {
			var officers = response.data;
			var ngay = thang + "/" + nam;
			var accounts = [];
			$http.get('/user/nhanvienxl').then(function (resUser) {
				accounts = resUser.data;
				for (var i = 0; i < officers.length; i++) {
					var nhanvien = officers[i];

					for (var j = 0; j < accounts.length; j++) {
						if (nhanvien.cmnd === accounts[j].cmnd) {
							nhanvien.account = accounts[j];
							break;
						}
					}
					officers[i] = nhanvien;
				}
			})
			$http.get('/user/nhanvienkt').then(function (resUser) {
				accounts = resUser.data;

				for (var i = 0; i < officers.length; i++) {
					var nhanvien = officers[i];

					for (var j = 0; j < accounts.length; j++) {
						if (nhanvien.cmnd === accounts[j].cmnd) {
							nhanvien.account = accounts[j];
							break;
						}
					}
					officers[i] = nhanvien;
				}
			})
			$http.get('/user/quantri').then(function (resUser) {
				accounts = resUser.data;

				for (var i = 0; i < officers.length; i++) {
					var nhanvien = officers[i];
					for (var j = 0; j < accounts.length; j++) {
						if (nhanvien.cmnd === accounts[j].cmnd) {
							nhanvien.account = accounts[j];
							break;
						}
					}
					officers[i] = nhanvien;
				}
			})

			$http.get('/lichnghitheothang?ngay=' + ngay).then(function (resDayOff) {
				var firstDay = new Date(nam, thang - 1, 1);
				var lastDay = new Date(nam, thang, 0);
				for (var l = 0; l < officers.length; l++) {
					var nhanvien = officers[l];
					nhanvien.lichnghi = [];
					nhanvien.ngaybatdaulamviec = new Date(nhanvien.ngaybatdaulamviec);
					var tgbatdauLamViec = nhanvien.ngaybatdaulamviec.getTime();
					var daysOf = 0;

					if (tgbatdauLamViec < firstDay.getTime() || (tgbatdauLamViec > firstDay.getTime() && tgbatdauLamViec < lastDay.getTime())) {
						for (var k = 0; k < resDayOff.data.length; k++) {
							var part = [];
							var lichban = resDayOff.data[k];
							if (lichban.cmnd === nhanvien.cmnd) {
								daysOf++;
								var day = lichban.ngay;
								if (day) {
									parts = day.split('/');
									lichban.ngay = new Date(parts[2], parts[1] - 1, parts[0]);

									lichban.ngay = new Date(lichban.ngay);
									var bd = findTimebyValue(lichban.giobd);
									var kt = findTimebyValue(lichban.giokt);
									if (lichban.giokt) {
										lichban.giokt = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + kt);
									}
									if (lichban.giobd) {
										lichban.giobd = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + bd);
									}
									nhanvien.lichnghi.push(lichban);
								}
							}
						}
					}

					var luongthang = nhanvien.luongtheothang;

					nhanvien.songaylamviec = 22;
					nhanvien.songaynghi = daysOf;

					if (tgbatdauLamViec > firstDay.getTime() && tgbatdauLamViec < lastDay.getTime()) {
						nhanvien.luong = (nhanvien.luongtheothang / nhanvien.songaylamviec) * (nhanvien.songaylamviec - nhanvien.songaynghi-nhanvien.ngaybatdaulamviec.getDate());
					}
					else{
						nhanvien.luong = (nhanvien.luongtheothang / nhanvien.songaylamviec) * (nhanvien.songaylamviec - nhanvien.songaynghi);
					}

					officers[l] = nhanvien;
				}

			})

			return officers;
		})
	}

	/*YEU CAU*/
	this.loadListRequest = function () {
		return $http.get('/yeucau').then(function (response) {
			var result = [];
			for (var j = 0; j < response.data.length; j++) {
				var data = response.data[j];
				data.ngaydatyeucau = new Date(moment(data.ngaydatyeucau).format('YYYY-MM-DD HH:mm'))
				var day = data.ngaylam;
				var parts;
				if (day) {
					var parts = day.split('/');
					/*$log.info(parts+ " - "+data.ngaylam);*/
					data.ngaylam = new Date(parts[2], parts[1] - 1, parts[0]);
				}

				/*data.ngaylam = new Date(moment(data.ngaylam).format('YYYY-MM-DD HH:mm'));*/
				//data.ngaylam = new Date(data.ngaylam);
				data.giobatdau = new Date(moment(parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + findTimebyValue(data.giobatdau)).format('YYYY-MM-DD HH:mm'));
				data.gioketthuc = new Date(moment(parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + findTimebyValue(data.gioketthuc)).format('YYYY-MM-DD HH:mm'));

				response.data[j] = data;
			}

			return response.data;
		})
	}

	this.loadRequestNew = function () {
		return $http.get('/notification').then(function (response) {
			return response.data;
		})
	}

	this.saveRequest = function (data) {
		data.ngaydatyeucau = new Date(data.ngaydatyeucau);
		data.ngaylam = data.ngaylam.getDate() + "/" + (data.ngaylam.getMonth() + 1) + "/" + data.ngaylam.getFullYear();

		data.giobatdau = (data.giobatdau.getHours() * 60) + data.giobatdau.getMinutes();
		data.gioketthuc = (data.gioketthuc.getHours() * 60) + data.gioketthuc.getMinutes();
		$log.info("day: " + data.ngaylam);
		return $http.post('/yeucau', data).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.updateRequest = function (data) {
		data.ngaydatyeucau = new Date(data.ngaydatyeucau);
		/*data.ngaylam = new Date(data.ngaylam);*/
		data.ngaylam = data.ngaylam.getDate() + "/" + (data.ngaylam.getMonth() + 1) + "/" + data.ngaylam.getFullYear();
		return $http.put('/yeucau/' + data._id, data).then(
			function successCallback(response) {
				return "Cập nhật thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.updateRequestStatus = function (data) {
		return $http.put('/yeucau/' + data.id, data).then(
			function successCallback(response) {
				return "Cập nhật thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.getRequestbyID = function (item) {
		return $http.get('/yeucau/' + item).then(
			function successCallback(response) {

				var data = response.data;
				data.ngaydatyeucau = new Date(moment(data.ngaydatyeucau).format('YYYY-MM-DD HH:mm'))
				var day = data.ngaylam;
				var parts = [];
				if (day) {
					parts = day.split('/');
					/*$log.info(parts+ " - "+data.ngaylam);*/
					data.ngaylam = new Date(parts[2], parts[1] - 1, parts[0]);

					data.ngaylam = new Date(data.ngaylam);
					var bd = findTimebyValue(data.giobatdau);
					var kt = findTimebyValue(data.gioketthuc);
					if (data.gioketthuc) {
						data.gioketthuc = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + kt);
						/*data.gioketthuc = new Date(moment(parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + kt).format('YYYY-MM-DD HH:mm'));*/
					}
					if (data.giobatdau) {
						data.giobatdau = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + bd);
						/*data.giobatdau = new Date(moment(parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + bd).format('YYYY-MM-DD HH:mm'));*/
					}
				}
				/*data.ngaylam = new Date(moment(data.ngaylam).format('YYYY-MM-DD HH:mm'));*/
				return data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}



	this.getRequestID = function () {
		return $http.get('/getid').then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.getRequestbyDate = function (date, cmnd) {
		return $http.get('/yeucaubydate?cmnd=' + cmnd + '&ngaylam=' + date).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			})
	}

	this.deleteRequestbyID = function (item) {
		return $http.delete('/yeucau/' + item).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	/*Fixer Schedule busy by Request */
	this.getBusyRequestbyId = function (item) {
		return $http.get('/lichlamviectho/' + item).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.saveBusyRequest = function (item) {
		/*item.ngay = item.ngay.getDate() + "/"+(item.ngay.getMonth()+1) +"/"+item.ngay.getFullYear();*/
		return $http.post('/lichlamviectho', item).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			}
		)
	}

	/*Skill*/
	this.getSkill = function () {
		return $http.get('/dichvu').then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.updateSkill = function (id, data) {
		return $http.put('/dichvu/' + id, data).then(
			function successCallback(response) {
				return "Cập nhật thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.saveSkill = function (data) {
		return $http.post('/dichvu', data).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.deleteSkill = function (id) {
		return $http.delete('/dichvu/' + id).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	/*District*/
	this.getDistrict = function () {
		return $http.get('/quan').then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	/*Fixer Personal*/
	this.requestOfFixer = function (value) {
		return $http.get('/yeucautho/' + value).then(
			function successCallback(response) {
				var result = [];
				for (var j = 0; j < response.data.length; j++) {
					var data = response.data[j];
					data.ngaydatyeucau = new Date(moment(data.ngaydatyeucau).format('YYYY-MM-DD HH:mm'))
					var day = data.ngaylam;
					var parts;
					if (day) {
						var parts = day.split('/');
						/*$log.info(parts+ " - "+data.ngaylam);*/
						data.ngaylam = new Date(parts[2], parts[1] - 1, parts[0]);

						data.ngaylam = new Date(data.ngaylam);
						var bd = findTimebyValue(data.giobatdau);
						var kt = findTimebyValue(data.gioketthuc);
						if (data.gioketthuc) {
							data.gioketthuc = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + kt);
						}
						if (data.giobatdau) {
							data.giobatdau = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + bd);
						}
					}

					/*data.ngaylam = new Date(moment(data.ngaylam).format('YYYY-MM-DD HH:mm'));
					//data.ngaylam = new Date(data.ngaylam);
					var bd = parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + findTimebyValue(data.giobatdau);
					var kt = parts[2] + '-' + parts[1] + '-' + parts[0] + ' ' + findTimebyValue(data.gioketthuc);
					data.giobatdau = new Date(moment(bd).format('YYYY-MM-DD HH:mm'));
					data.gioketthuc = new Date(moment(kt).format('YYYY-MM-DD HH:mm'));*/

					response.data[j] = data;
				}

				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.requestOfFixerNew = function (value) {
		return $http.get('/notification/' + value).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	/*Customer*/
	this.getcustomer = function () {
		return $http.get('/khachhang').then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.getcustomerbyId = function (id) {
		return $http.get('/khachhang/' + id).then(
			function successCallback(response) {
				return response.data;
			},
			function errorCallback(response) {
				return response.error;
			}
		)
	}

	this.updatecustomer = function (id, data) {
		return $http.put('/khachhang/' + id, data).then(
			function successCallback(response) {
				return "Cập nhật thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.savecustomer = function (data) {
		return $http.post('/khachhang', data).then(
			function successCallback(response) {
				return "Thêm thành công."
			},
			function errorCallback(response) {
				return "Vui lòng kiểm tra lai các thông tin."
			})
	}

	this.deletecustomer = function (id) {
			return $http.delete('/khachhang/' + id).then(
				function successCallback(response) {
					return response.data;
				},
				function errorCallback(response) {
					return response.error;
				}
			)
		}
		/*THỐNG KÊ*/
	this.dashboard = function (start, end) {
		return $http.get('/yeucau').then(function (response) {
			var result = [];
			for (var i = 0; i < response.data.length; i++) {
				var parts;
				var data = response.data[i];
				var day = data.ngaylam;

				if (day) {
					var parts = day.split('/');
					data.ngaylam = new Date(parts[2], parts[1] - 1, parts[0]);
					var bd = findTimebyValue(data.giobatdau);
					var kt = findTimebyValue(data.gioketthuc);
					data.giobatdau = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + bd);
					data.gioketthuc = new Date(parts[1] + "/" + parts[0] + "/" + parts[2] + " " + kt);

					if (checkDateIn(start, end, data.ngaylam)) {
						result.push(data);
					}
				}
			}

			return result;
		})
	}

	var checkDateIn = function (start, end, date) {
		var timeStr = start.getTime();
		var timeEnd = end.getTime();
		var timeDate = date.getTime();
		if (timeStr <= timeDate && timeDate <= timeEnd) {
			return true;
		}
		return false;
	}
};
