var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var lichbantyc = require('../model/lichlamviectho');

var lichbantycmodel = mongoose.model('lichlamviectho');

/* GET users listing. */
lichbantyc.methods(['post']);
lichbantyc.register(router, '/lichlamviectho');

router.get('/lichlamviectho', function (req, res, next) {
	lichbantycmodel.find({}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/lichlamviecthotheongay', function (req, res, next) {
	var cmnd = req.query.cmnd;
	var ngay = req.query.ngay;
	lichbantycmodel.find({
		'cmnd': cmnd,
		'ngay': ngay
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/lichlamviectheothang/:cmnd', function (req, res, next) {
	lichbanthomodel.find({
		'cmnd': req.params.cmnd, 'ngay': new RegExp(req.query.ngay, "iu")
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.put('/lichlamviectho/:id', function (req, res, next) {
	lichbantycmodel.update({
		'_id': req.params.id
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.delete('/lichlamviectho/:id', function (req, res, next) {
	lichbantycmodel.remove({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

module.exports = router;
