var db = require('./../db.js');
var q = require('q');

var Request = {};

Request.create = function(req, hook){
	var deferred = q.defer();
	db.query('INSERT INTO `requests` SET ?', {
		'hookid': hook.id,
		'passed': hook.checkRequest(req) ? 1 : 0,
		'header': JSON.stringify(req.headers),
		'body': JSON.stringify(req.body),
		'query': JSON.stringify(req.query)
	}, function(err, result){
		if (err) deferred.reject(err);
		else deferred.resolve(result.insertId);
	});
	return deferred.promise;
};

Request.getAll = function(page){
	if (page === undefined || page === null)
		page = 0;
	var limit = 100;
	var deferred = q.defer();
	db.query('SELECT `r`.`id`, `r`.`logid`, `r`.`hookid`, `r`.`created`, `r`.`passed`, `h`.`name` FROM `requests` AS `r` INNER JOIN `hooks` AS `h` ON `h`.`id` = `r`.`hookid` WHERE 1 ORDER BY `id` DESC LIMIT ?, ?', [page*limit, limit], function(err, rows){
		if (err) deferred.reject(err);
		else deferred.resolve(rows);
	});
	return deferred.promise;
};

Request.getByHookId = function(hookid, page){
	var deferred = q.defer();
	if (page === undefined || page === null)
		page = 0;
	if (hookid === undefined || hookid === null){
		deferred.reject(new Error("No hookid given"));
		return deferred.promise;
	}
	var limit = 100;
	
	db.query('SELECT `r`.`id`,`r`.`logid`, `r`.`hookid`, `r`.`created`, `r`.`passed`, `h`.`name` FROM `requests` AS `r` INNER JOIN `hooks` AS `h` ON `h`.`id` = `r`.`hookid` WHERE `hookid` = ? ORDER BY `id` DESC LIMIT ?, ?', [hookid, page*limit, limit], function(err, rows){
		if (err) deferred.reject(err);
		else deferred.resolve(rows);
	});
	return deferred.promise;
};

Request.setLogId = function(id, logid){
	var deferred = q.defer();
	db.query('UPDATE `requests` SET ? WHERE `id` = ?', [{logid: logid}, id], function(err, res){
		if (err) deferred.reject(err);
		else deferred.resolve();
	});
	return deferred.promise;
};

Request.getById = function(id){
	var deferred = q.defer();
	if (id === undefined || id === null) {
		deferred.reject(new Error("No request id given"));
		return deferred.promise;
	}
	db.query("SELECT * FROM `requests` WHERE `id` = ? LIMIT 1", id, function(err, rows){
		if (err || rows.length != 1)
			deferred.reject(err || new Error("Not request with that id: "+ id));
		else {
			hook = require('./hook.js');
			hook.getById(rows[0].hookid).then(function(hook){
				var obj = rows[0];
				obj.hook = hook;
				obj.header = JSON.parse(obj.header);
				obj.body = JSON.parse(obj.body);
				obj.query = JSON.parse(obj.query);
				deferred.resolve(obj);
			}, deferred.reject);
		}
	});
	return deferred.promise;
};

exports = module.exports = Request;