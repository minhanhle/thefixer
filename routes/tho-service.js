var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var tho = require('../model/tho');
var lichlamviectho = require('../model/lichlamviectho');
var lichbantho = require('../model/lichban-tho');

var lichbanthomodel = mongoose.model('lichbantho');
var lichbantycmodel = mongoose.model('lichlamviectho');
var thomodel = mongoose.model('tho', tho);

/* GET users listing. */
tho.methods(['post']);
tho.register(router, '/tho');

router.get('/tho', function (req, res, next) {
	thomodel.find({'xacnhan': true}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

router.get('/thomoi', function (req, res, next) {
	thomodel.find({'xacnhan': false}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

router.get('/timkiemtho', function (req, res, next) {
	res.header("Content-Type", "application/json; charset=utf-8");

	var hoten = req.query.hoten;
	var result = [];
	thomodel.find({
		'hoten': new RegExp(req.query.hoten, "iu"), 'diachi.tenkhuvuc': new RegExp(req.query.quan, "iu")
	}, function (err, data) {
		if (err) {
			res.send(err);
		} else {
			res.send(data);
		}
	})

});

function kiemtrathoigian(start, end, bd, kt) {
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
		if (sttho.indexOf(stkt) > -1) {
			return true;
		}
	}
	return false;
}

router.put('/tho/:cmnd', function (req, res, next) {
	thomodel.findOneAndUpdate({
		'cmnd': req.params.cmnd
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		res.send(data)
	})
});

router.delete('/tho/:cmnd', function (req, res, next) {
	thomodel.remove({
		'cmnd': req.params.cmnd
	}, function (err, result) {
		if (err)
			res.send(err);
		else
			res.send({
				messages: "Xóa thành công"
			});
	})
});

router.get('/tho/:cmnd', function (req, res, next) {
	thomodel.findOne({
		'cmnd': req.params.cmnd
	}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

module.exports = router;
