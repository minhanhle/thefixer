var restful = require('node-restful');
var mongoose = restful.mongoose;

var lichbanthoSchema = new mongoose.Schema({
	cmnd: String,
	ngay: String,
	giobd: Number,
	giokt: Number
});
module.exports = restful.model('lichbantho', lichbanthoSchema);
