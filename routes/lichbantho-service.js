var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var lichbantho = require('../model/lichban-tho');

var lichbanthomodel = mongoose.model('lichbantho');

/* GET users listing. */
lichbantho.methods(['post']);
lichbantho.register(router, '/lichbantho');

router.get('/lichbantho', function (req, res, next) {
	lichbanthomodel.find({}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/lichbanthotheongay', function (req, res, next) {
	var cmnd = req.query.cmnd;
	var ngay = req.query.ngay;
	console.log('cmnd: ' + cmnd + ', ngay:' + ngay);
	lichbanthomodel.find({
		'cmnd': cmnd,
		'ngay': ngay
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/lichnghitheothang', function (req, res, next) {
	lichbanthomodel.find({
		'ngay': new RegExp(req.query.ngay, "iu")
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/lichbantho/:cmnd', function (req, res, next) {
	lichbanthomodel.find({
		'cmnd': req.params.cmnd
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.put('/lichbantho/:cmnd', function (req, res, next) {
	lichbanthomodel.update({
		'cmnd': req.params.cmnd
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.delete('/lichbantho/:id', function (req, res, next) {
	lichbanthomodel.remove({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

module.exports = router;
