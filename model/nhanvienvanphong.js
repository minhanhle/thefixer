var restful = require('node-restful');
var mongoose = restful.mongoose;

var nhanvienvanphongSchema = new mongoose.Schema({
	cmnd: {
		type: String,
		unique: true
	},
	hoten: String,
	ngaysinh: Date,
	gioitinh: String,
	sodt: Number,
	email: String,
	quequan: String,
	diachihientai: String,
	hinhanh: String,
	luongtheothang: Number,
	xacnhan: Boolean,
	ngaybatdaulamviec: Date
});
module.exports = restful.model('nhanvienvanphong', nhanvienvanphongSchema);
