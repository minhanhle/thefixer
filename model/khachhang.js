var restful = require('node-restful');
var mongoose = restful.mongoose;

var khahchangSchema = new mongoose.Schema({
	taikhoan: String,
	matkhau: String,
	hinhanh: String,
	otp: String,
	diachi: String,
	email: String,
	hoten: String
});
module.exports = restful.model('accountkh', khahchangSchema);
