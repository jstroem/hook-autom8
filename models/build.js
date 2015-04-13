var db = require('./../db.js');
var uuid = require('node-uuid');
var q = require('q');

var Build = {};

Build.getAll = function(){
	var deferred = q.defer();
	db.query("SELECT * FROM `builds` WHERE 1", function(err,rows){
		if (err)
			deferred.reject(err);
		else
			deferred.resolve(rows);
	});
	return deferred.promise;
};

Build.getById = function(id){
	var deferred = q.defer();
	if (id === undefined || id === null) {
		deferred.reject(new Error("No id"));
		return deferred.promise;
	}

	db.query("SELECT * FROM `builds` WHERE `id` = ?", id, function(err, rows){
		if (err || rows.length !== 1)
			deferred.reject(err || new Error("No build found with the id: "+ id));
		else
			deferred.resolve(rows[0]);
	});
	return deferred.promise;
};


Build.remove = function(build){
	var deferred = q.defer();
	db.query('DELETE FROM `builds` WHERE `id` = ?', build.id, function(err, result){
		if (err) deferred.reject(err);
		else deferred.resolve();
	});
	return deferred.promise;
};

Build.create = function(obj){
	var deferred = q.defer();
	var err = null;
	if (obj.name === undefined || obj.name === null)
		err = new Error("No name");
	else if (obj.error === undefined || obj.error === null)
		err = new Error("No error");
	else if (obj.build === undefined || obj.build === null)
		err = new Error("No build");

	if (err !== null){
		deferred.reject(err);
		return deferred.promise;
	}

	db.query('INSERT INTO `builds` SET ?', { name: obj.name, build: obj.build, error: obj.error }, function(err,result){
		if (err) deferred.reject(err);
		else {
			Build.getById(result.insertId).then(deferred.resolve, deferred.reject);
		}
	});

	return deferred.promise;
};

Build.registerRun = function(id){
	var deferred = q.defer();
	if (id === undefined || id === null) {
		deferred.reject(new Error("No id"));
		return deferred.promise;
	}

	db.query('UPDATE `builds` SET `lastrun` = NOW() WHERE `id` = ?', id, function(err, res){
		if (err) deferred.reject(err);
		else deferred.resolve();
	});
	return deferred.promise;
};

Build.update = function(build, obj){
	var deferred = q.defer();
	var err = null;

	if (err !== null){
		deferred.reject(err);
		return deferred.promise;
	}
	var query = db.query('UPDATE `builds` SET ? WHERE `id` = ?', [{name: obj.name || build.name, build: obj.build || build.build, error: obj.error || build.error}, build.id], function(err, result){
		if (err) deferred.reject(err);
		else deferred.resolve(build);
	});

	return deferred.promise.then(function(){
		return Build.getById(build.id);
	});
};

module.exports = Build;