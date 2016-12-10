var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var nhanvienvanphong = require('../model/nhanvienvanphong');

var nhanvienvanphongmodel = mongoose.model('nhanvienvanphong');

/* GET users listing. */
nhanvienvanphong.methods(['post']);
nhanvienvanphong.register(router, '/nhanvienvanphong');

router.get('/nhanvienvanphong', function (req, res, next) {
	nhanvienvanphongmodel.find({}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/nhanvienvanphong/:cmnd', function (req, res, next) {
	nhanvienvanphongmodel.findOne({
		'cmnd': req.params.cmnd
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.put('/nhanvienvanphong/:cmnd', function (req, res, next) {
	nhanvienvanphongmodel.update({
		'cmnd': req.params.cmnd
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.delete('/nhanvienvanphong/:cmnd', function (req, res, next) {
	nhanvienvanphongmodel.remove({
		'cmnd': req.params.cmnd
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

module.exports = router;
