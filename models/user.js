var db = require('./../db.js');

var sha1 = require('./../sha1.js');
var q = require('q');

var User = {};

User.FindByUsername = function(username){
	var deferred = q.defer();
	db.query('SELECT * FROM `users` WHERE `username` = ? LIMIT 1', username, function(err, rows){
		if (err || rows.length == 0)
			deferred.reject(err || true);
		else
			deferred.resolve(rows[0]);
	});
	return deferred.promise;
};

User.FindById = function(id){
	var deferred = q.defer();
	db.query('SELECT * FROM `users` WHERE `id` = ? LIMIT 1', id, function(err, rows){
		if (err || rows.length == 0)
			deferred.reject(err || true);
		else
			deferred.resolve(rows[0]);
	});
	return deferred.promise;
}

exports = module.exports = User;