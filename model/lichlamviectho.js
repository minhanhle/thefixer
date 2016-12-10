var restful = require('node-restful');
var mongoose = restful.mongoose;

var lichlamviecthoSchema = new mongoose.Schema({
	mayc: String,
	hotenKH: String,
	cmnd: String,
	ngay: String,
	giobd: Number,
	giokt: Number
});
module.exports = restful.model('lichlamviectho', lichlamviecthoSchema);
