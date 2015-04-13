var db = require('./../db.js');
var q = require('q');
var path = require('./../path.js');

var HookRules = {};

var HookRuleObject = function(obj){
	this.type = obj.type;
	this.key = obj.key;
	this.value = obj.value;
	this.id = obj.id;
	this.hookid = obj.hookid;
};

HookRuleObject.prototype.create = function(obj){
	return new HookRuleObject(obj);
};

HookRuleObject.prototype.checkRequest = function(req){
	var res;
	if (this.type == 'header')
		res = path(req.headers, this.key);
	else if (this.type == 'body')
		res = path(req.body, this.key);
	else if (this.type == 'query')
		res = path(req.query, this.key);

	if (res === undefined)
		return false;
	try {
		regex = new RegExp(this.value);
		return regex.test(res);
	} catch(e){
		return false;
	}
};

HookRules.getByHookId = function(hookid){
	var deferred = q.defer();
	if (hookid === undefined || hookid === null)
		deferred.reject("No hookid");
	else {
		db.query("SELECT * FROM `hookrules` WHERE `hookid` = ?", hookid, function(err,rows){
			if (err)
				deferred.reject(err);
			else
				deferred.resolve(rows.map(HookRuleObject.prototype.create));
		});
	}
	return deferred.promise;
};

HookRules.getById = function(id){
	var deferred = q.defer();
	db.query("SELECT * FROM `hookrules` WHERE `id` = ? LIMIT 1", id, function(err, rows){
		if (err || rows.length != 1)
			deferred.reject(err || true);
		else
			deferred.resolve(HookRuleObject.prototype.create(rows[0]));
	});
	return deferred.promise;
};

HookRules.removeByHookId = function(hookid){
	var deferred = q.defer();
	if (hookid === undefined || hookid === null)
		deferred.reject("No hookid");
	else {
		db.query("DELETE FROM `hookrules` WHERE `hookid` = ?", hookid, function(err,rows){
			if (err)
				deferred.reject(err);
			else
				deferred.resolve();
		});
	}
	return deferred.promise;
};

HookRules.create = function(obj){
	var deferred = q.defer();
	var err = null;
	if (obj.type === undefined || obj.type === null)
		err = new Error("No type");
	else if (obj.hookid === undefined || obj.hookid === null)
		err = new Error("No hookid");
	else if (obj.key === undefined || obj.key === null)
		err = new Error("No key");
	else if (obj.value === undefined || obj.value === null)
		err = new Error("No value");

	if (err !== null){
		deferred.reject(err);
		return deferred.promise;
	}

	db.query('INSERT INTO `hookrules` SET ?', {hookid: obj.hookid, type: obj.type, key: obj.key, value: obj.value}, function(err,result){
		if (err) deferred.reject(err);
		else {
			HookRules.getById(result.insertId).then(deferred.resolve, deferred.reject);
		}
	});

	return deferred.promise;
};

exports = module.exports = HookRules;