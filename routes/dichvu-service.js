var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var dichvu = require('../model/dichvu');

var dichvumodel = mongoose.model('dichvu');

/* GET users listing. */
dichvu.methods(['post']);
dichvu.register(router, '/dichvu');

router.get('/dichvu', function (req, res, next) {
	dichvumodel.find({}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.get('/dichvu/:id', function (req, res, next) {
	dichvumodel.findOne({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.put('/dichvu/:id', function (req, res, next) {
	dichvumodel.update({
		'_id': req.params.id
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

router.delete('/dichvu/:id', function (req, res, next) {
	dichvumodel.remove({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		else
			res.send(data);
	})
});

module.exports = router;
