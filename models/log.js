var db = require('./../db.js');
var q = require('q');

var Log = {};

Log.getAll = function(page){
	if (page === undefined || page === null)
		page = 0;
	var limit = 100;
	var deferred = q.defer();
	db.query('SELECT `l`.*, `h`.`name` AS `hookname`, `b`.`name` AS `buildname` FROM `logs` AS `l` INNER JOIN `hooks` AS `h` ON `h`.`id` = `l`.`hookid` INNER JOIN `builds` AS `b` ON `b`.`id` = `l`.`buildid` WHERE 1 ORDER BY `id` DESC LIMIT ?, ?', [page*limit, limit], function(err, rows){
		if (err) deferred.reject(err);
		else deferred.resolve(rows);
	});
	return deferred.promise;
};

Log.getByHookId = function(hookid, page){
	var deferred = q.defer();
	if (page === undefined || page === null)
		page = 0;
	if (hookid === undefined || hookid === null){
		deferred.reject(new Error("No hookid given"));
		return deferred.promise;
	}
	var limit = 100;
	
	db.query('SELECT `l`.*, `h`.`name` AS `hookname`, `b`.`name` AS `buildname` FROM `logs` AS `l` INNER JOIN `hooks` AS `h` ON `h`.`id` = `l`.`hookid` INNER JOIN `builds` AS `b` ON `b`.`id` = `l`.`buildid` WHERE `l`.`hookid` = ? ORDER BY `id` DESC LIMIT ?, ?', [hookid, page*limit, limit], function(err, rows){
		if (err) deferred.reject(err);
		else deferred.resolve(rows);
	});
	return deferred.promise;
};

Log.getByBuildId = function(buildid, page){
	var deferred = q.defer();
	if (page === undefined || page === null)
		page = 0;
	if (buildid === undefined || buildid === null){
		deferred.reject(new Error("No buildid given"));
		return deferred.promise;
	}
	var limit = 100;
	
	db.query('SELECT `l`.*, `h`.`name` AS `hookname`, `b`.`name` AS `buildname` FROM `logs` AS `l` INNER JOIN `hooks` AS `h` ON `h`.`id` = `l`.`hookid` INNER JOIN `builds` AS `b` ON `b`.`id` = `l`.`buildid` WHERE `l`.`buildid` = ? ORDER BY `id` DESC LIMIT ?, ?', [buildid, page*limit, limit], function(err, rows){
		if (err) deferred.reject(err);
		else deferred.resolve(rows);
	});
	return deferred.promise;
};

Log.getById = function(id){
	var deferred = q.defer();
	if (id === undefined || id === null) {
		deferred.reject(new Error("No log id given"));
		return deferred.promise;
	}
	db.query("SELECT * FROM `logs` WHERE `id` = ? LIMIT 1", id, function(err, rows){
		if (err || rows.length != 1)
			deferred.reject(err || new Error("Not log with that id: "+ id));
		else {
			var obj = rows[0];
			obj.build = JSON.parse(obj.build);
			obj.error = JSON.parse(obj.error);
			obj.build_error = JSON.parse(obj.build_error);
			obj.error_error = JSON.parse(obj.error_error);
			deferred.resolve(obj);
		}
	});
	var log, hook, build;
	return deferred.promise.then(function(l){
		var Hook = require('./hook.js');
		log = l;
		return Hook.getById(log.hookid);
	}).then(function(h){
		hook = h;
		var Build = require('./build.js');
		return Build.getById(log.buildid);
	}).then(function(b){
		build = b;
		return {
			log: log,
			hook: hook,
			build: build
		};
	});
};

exports = module.exports = Log;