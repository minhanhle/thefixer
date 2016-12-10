var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var yeucau = require('../model/yeucau');

var yeucaumodel = mongoose.model('yeucau', yeucau);

/* GET users listing. */
yeucau.methods(['post']);
yeucau.register(router, '/yeucau');

router.get('/yeucau', function (req, res, next) {
	yeucaumodel.find({}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

router.get('/getid', function (req, res, next) {
	yeucaumodel.find({}, function (err, data) {
		if (err) {
			res.send(err);
		}
		if (data.length === 0) {
			res.send('YC001');
		} else {
			var lastID = data.slice(-1).pop().mayc;
			var index = parseInt(lastID.substring(2));
			index = index + 1;
			if (index < 10) {
				res.send("YC00" + index);
			} else if (index < 100) {
				res.send("YC0" + index);
			} else if (index < 1000) {
				res.send("YC" + index);
			}
		}
	})
})

router.get('/notification', function (req, res) {
	yeucaumodel.find({
		'trangthai': "Bắt đầu"
	}, function (err, data, next) {
		if (err)
			res.send(err);
		res.send(data);
	})
})

router.get('/notification/:cmnd', function (req, res) {
	yeucaumodel.find({
		'trangthai': "Bắt đầu",
		'cmndTho': req.params.cmnd
	}, function (err, data, next) {
		if (err)
			res.send(err);
		res.send(data);
	})
})

router.put('/yeucau/:id', function (req, res, next) {
	yeucaumodel.findOneAndUpdate({
		'_id': req.params.id
	}, req.body, function (err, data) {
		if (err)
			res.send(err);
		res.send(data)
	})
});

router.delete('/yeucau/:id', function (req, res, next) {
	console.log('_id:'+req.params.id);
	yeucaumodel.remove({
		'_id': req.params.id
	}, function (err, result) {
		if (err)
			res.send(err);
		else
			res.send({
				messages: "Xóa thành công"
			});
	})
});

router.get('/yeucauhoanthanhtheothanng', function(req, res, next) {
	yeucau.find({
		'ngaylam': new RegExp(req.query.ngaylam, "iu"),
		'trangthai': 'Kết thúc'
	}, function (err, data) {
		if (err)
			res.send(err);
		else {
			res.send(data);
		}
	})
})

router.get('/yeucaubydate', function (req, res, next) {
	var start = req.query.giobd;
	var end = req.query.giokt;
	var bd, kt;
	var result = [];
	yeucau.find({
		'cmndTho': req.query.cmnd,
		'ngaylam': req.query.ngaylam
	}, function (err, data) {
		if (err)
			res.send(err);
		else {
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

router.get('/yeucau/:id', function (req, res, next) {
	console.log('_id:'+req.params.id);
	yeucaumodel.findOne({
		'_id': req.params.id
	}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

router.get('/yeucautho/:cmnd', function (req, res, next) {
	yeucaumodel.find({
		'cmndTho': req.params.cmnd
	}, function (err, data) {
		if (err)
			res.send(err);
		res.send(data);
	})
});

module.exports = router;
