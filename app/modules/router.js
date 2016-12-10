angular.module("fixhomeApp")
	.config(fixhomeRouter);

function fixhomeRouter($stateProvider) {
	$stateProvider
		.state("home", {
			url: "/home",
			views: {
				"": {
					templateUrl: "views/main.html",
				}
			}
		})
		.state("yeucau", {
			url: "/yeucau",
			views: {
				"": {
					templateUrl: "views/yeucau.html",
					controller: "yeuCauCtrl",
					controllerAs: "vm"
				},
				"tree@yeucau": {
					templateUrl: "views/yeucau-tree.html",
				},
				"table@yeucau": {
					templateUrl: "views/yeucau-table.html",
				}
			}
		})
		.state("nhanvien", {
			url: "/nhanvien",
			views: {
				"": {
					templateUrl: "views/nhanvien.html",
					controller: "nhanvienCtrl",
					controllerAs: "vm"
				},
				"tree@nhanvien": {
					templateUrl: "views/nhanvien-tree.html",
				},
				"table@nhanvien": {
					templateUrl: "views/nhanvien-table.html",
				}
			}
		})
		.state("nhanvien-detail", {
			url: "/chitietnhanvien/:cmnd",
			views: {
				"": {
					templateUrl: "views/nhanvien-chitiet.html",
					controller: "nhanvienCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("nhanvienvp-detail", {
			url: "/chi-tiet-nhan-vien-van-phong/:cmnd",
			views: {
				"": {
					templateUrl: "views/nhanvienvp-chitiet.html",
					controller: "nhanvienCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("nhanvien-calendar", {
			url: "/	lichlamviecnhanvien/:cmnd",
			views: {
				"": {
					templateUrl: "views/laplich.html",
					controller: "nhanvienCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("yeucau-chitiet", {
			url: "/chitietyeucau/:id",
			views: {
				"": {
					templateUrl: "views/yeucau-chitiet.html",
					controller: "yeuCauCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("nhanvien-new", {
			url: "/them-nhan-vien",
			views: {
				"": {
					templateUrl: "views/nhanvien-new.html",
					controller: "nhanvienCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("nhanvienvp-new", {
			url: "/them-nhan-vien-van-phong",
			views: {
				"": {
					templateUrl: "views/nhanvienvp-new.html",
					controller: "nhanvienCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("nhanvien-lichban", {
			url: "/dangkilichlamviec/:cmnd",
			views: {
				"": {
					templateUrl: "views/nhanvien-lichlamviec.html",
					controller: "lichbanthoCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("yeucau-new", {
			url: "/themyeucau/:cmnd",
			views: {
				"": {
					templateUrl: "views/yeucau-new.html",
					controller: "yeuCauCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state('dichvu', {
			url: "/dichvu",
			views: {
				"": {
					templateUrl: "views/dichvu.html",
					controller: "dichvuCtrl",
					controllerAs: "vm"
				},
				"tree@dichvu": {
					templateUrl: "views/dichvu-tree.html",
				},
				"table@dichvu": {
					templateUrl: "views/dichvu-table.html",
				}
			}
		})
		.state("dichvu-new", {
			url: "/themdichvu",
			views: {
				"": {
					templateUrl: "views/dichvu-new.html",
					controller: "dichvuCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state('khachhang', {
			url: "/khachhang",
			views: {
				"": {
					templateUrl: "views/khachhang.html",
					controller: "khachhangCtrl",
					controllerAs: "vm"
				},
				"tree@khachhang": {
					templateUrl: "views/khachhang-tree.html",
				},
				"table@khachhang": {
					templateUrl: "views/khachhang-table.html",
				}
			}
		})
		.state('khachhang-chitiet', {
			url: "/khachhang/:id",
			views: {
				"": {
					templateUrl: "views/khachang-chitiet.html",
					controller: "khachhangCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state('khachhang-new', {
			/*url: "/themkhachhang",*/
			parent: 'khachhang',
			views: {
				"table@khachhang": {
					templateUrl: "views/khachhang-new.html",
					controller: "khachhangCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state('thongke', {
			url: "/thongke",
			views: {
				"": {
					templateUrl: "views/thongke.html",
					controller: "thongkeCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("login", {
			url: "/login",
			views: {
				"": {
					templateUrl: "views/login.html",
					controller: "loginCtrl",
					controllerAs: "vm"
				}
			}
		})
		.state("canhan", {
			url: "/canhan",
			views: {
				"": {
					templateUrl: "views/canhan.html",
					controller: "caNhanCtrl",
					controllerAs: "vm"
				},
				"tree@canhan": {
					templateUrl: "views/canhan-tree.html",
				},
				"table@canhan": {
					templateUrl: "views/canhan-table.html",
				}
			}
		})
		.state("canhan-yeucau-chitiet", {
			url: "/canhanyeucauchitiet/:mayc",
			views: {
				"": {
					templateUrl: "views/canhan-yeucau-chitiet.html",
					controller: "caNhanCtrl",
					controllerAs: "vm"
				}
			}
		})
};
