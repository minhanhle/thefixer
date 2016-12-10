var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var khachhang = require('../model/khachhang');

var khachhangmodel = mongoose.model('accountkh', khachhang);

/* GET users listing. */
khachhang.methods(['post']);
khachhang.register(router, '/khachhang');

router.get('/khachhang', function (req, res, next) {
	khachhangmodel.find({}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

router.get('/khachhang/:id', function (req, res, next) {
	khachhangmodel.findOne({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.put('/khachhang/:id', function (req, res, next) {
	khachhangmodel.update({
		'_id': req.params.id
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.delete('/khachhang/:id', function (req, res, next) {
	khachhangmodel.remove({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

module.exports = router;
