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