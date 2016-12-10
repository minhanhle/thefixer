var restful = require('node-restful');
var mongoose = restful.mongoose;

var yeuCauSchema = new mongoose.Schema({
	ngaydatyeucau: Date,
	hotenKH: String,
	sodt: Number,
	email: String,
	diachi: String,
	cmndTho: String,
	hotenTho: String,
	sdtTho: String,
	dichvuyc: [],
	quan: String,
	ngaylam: String,
	giobatdau: Number,
	gioketthuc: Number,
	phidichvu: Number,
	mota: String,
	nhanxet: String,
	trangthai: String
});

module.exports = restful.model('yeucau', yeuCauSchema);
