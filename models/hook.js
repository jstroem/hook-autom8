var db = require('./../db.js');
var uuid = require('node-uuid');
var HookRules = require('./hookrules.js');
var Build = require('./build.js');
var Request = require('./request.js');
var Handlebars = require('handlebars');
var exec = require('child_process').exec;
var q = require('q');

Handlebars.registerHelper('JSON', function(context) {
    return new Handlebars.SafeString(JSON.stringify(context));
});

var Hook = Hook || {};

var HookObject = function(obj){
	this.name = obj.name;
	this.id = obj.id;
	this.hash = obj.hash;
	this.rules = [];
	this.buildid = obj.buildid;
	this.build = null;
};

HookObject.prototype.create = function(obj){
	var hook = new HookObject(obj);
	return HookRules.getByHookId(hook.id).then(function(rules){
		hook.rules = rules;
		return Build.getById(hook.buildid);
	}).then(function(build){
		hook.build = build;
		return hook;
	});
};

HookObject.prototype.update = function(obj){
	console.log(obj.name);
	return Hook.update(this, obj);
};

HookObject.prototype.removeRules = function(){
	var deferred = q.defer();
	var self = this;
	HookRules.removeByHookId(this.id).then(function(){
		self.rules = [];
		deferred.resolve(self);
	}, deferred.reject);
	return deferred.promise;
};

HookObject.prototype.addRule = function(obj){
	var deferred = q.defer();
	var self = this;
	obj.hookid = this.id;
	HookRules.create(obj).then(function(rule){
		self.rules.push(rule);
		deferred.resolve(self);
	}, deferred.reject);
	return deferred.promise;
};

HookObject.prototype.addRules = function(objs){
	var self = this;
	var deferred = q.defer();
	deferred.resolve(self);
	return objs.reduce(function(acc, obj){
		return acc.then(function(){
			return self.addRule(obj);
		});
	}, deferred.promise);
};

HookObject.prototype.getRequests = function(page){
	return Request.getByHookId(this.id, page);
};

HookObject.prototype.remove = function(){
	return Hook.remove(this);
};

function BuildError(msg, context, result, error) {
    this.name = "BuildError";
    this.context = context;
    this.result = result;
    this.message = (msg || "");
    this.error = error;
}
BuildError.prototype = Error.prototype;

HookObject.prototype.runBuild = function(req){
	var deferred = q.defer();
	var self = this;
	var context = {
		request: req,
		hook: this,
		uuid: uuid.v4()
	};
	var build = Handlebars.compile(this.build.build);
	try {
		build = build(context).split(/\r?\n/);
	} catch(e){
		deferred.reject(new BuildError("The build was not pased correctly", context, [], e));
		return deferred.promise;
	}
	var res = [];

	deferred.resolve([context,res]);
	return build.reduce(function(acc, cmd){
		return acc.then(function(arr){
			var context = arr[0], res = arr[1];
			var deferred = q.defer();
			var child = exec(cmd, function(err, so, se){
				res.push({
					cmd: cmd,
					stdout: so,
					stderr: se
				});
				if (err) deferred.reject(new BuildError("Failed running cmd: "+ cmd, context, res, err));
				else deferred.resolve([context, res]);
			});
			return deferred.promise;
		});
	}, deferred.promise);
};

HookObject.prototype.runError = function(req, err) {
	var deferred = q.defer();
	var self = this;

	var context = err.context || {
		request: req,
		hook: this
	};
	var result = err.result;

	var stdout = [];
	var stderr = [];
	for(var i = 0; i < result.length; i++){
		stdout.push(result[i].stdout);
		stderr.push(result[i].stderr);
	}
	context.stdout = stdout.join('\n');
	context.stderr = stderr.join('\n');
	context.error = err;


	var build = Handlebars.compile(this.build.error);
	try {
		build = build(context).split(/\r?\n/);
	} catch(e){
		deferred.reject(new BuildError("The error was not pased correctly",context, [], e));
		return deferred.promise;
	}

	var res = [];
	deferred.resolve([context, res]);
	return build.reduce(function(acc, cmd){
		return acc.then(function(arr){
			var context = arr[0], res = arr[1];
			var deferred = q.defer();
			var child = exec(cmd, function(err, so, se){
				res.push({
					cmd: cmd,
					stdout: so,
					stderr: se
				});
				if (err) deferred.reject(new BuildError("Failed running cmd: "+ cmd, context, res, err));
				else deferred.resolve([context, res]);
			});
			return deferred.promise;
		});
	}, deferred.promise);
};

HookObject.prototype.registerBuildSuccess = function(requestId, context, result) {
	var deferred = q.defer();
	var self = this;
	var r = db.query("INSERT INTO `logs` SET ?", {
		hash: context.uuid,
		build: JSON.stringify(result),
		status: 'success',
		requestid: requestId,
		hookid: self.id,
		buildid: self.buildid
	}, function(err, res){
		if (err) deferred.reject(err);
		else deferred.resolve(res.insertId);
	});
	
	return deferred.promise;
};

HookObject.prototype.registerBuildFailed = function(requestId, err, eContext, eResult) {
	var deferred = q.defer();
	var self = this;
	db.query("INSERT INTO `logs` SET ?", {
		hash: eContext.uuid,
		build: JSON.stringify(err.result),
		build_error: JSON.stringify(err.error),
		error: JSON.stringify(eResult),
		status: 'failed',
		requestid: requestId,
		hookid: self.id,
		buildid: self.buildid
	}, function(err, res){
		if (err) deferred.reject(err);
		else deferred.resolve(res.insertId);
	});
	return deferred.promise;
};

HookObject.prototype.registerBuildErrorFailed = function(requestId, buildError, errorError) {
	var deferred = q.defer();
	var self = this;
	db.query("INSERT INTO `logs` SET ?", {
		hash: buildError.context.uuid,
		build: JSON.stringify(buildError.result),
		build_error: JSON.stringify(buildError.error),
		error: JSON.stringify(errorError.result),
		error_error: JSON.stringify(errorError.error),
		status: 'error_failed',
		requestid: requestId,
		hookid: self.id,
		buildid: self.buildid
	}, function(err, res){
		if (err) deferred.reject(err);
		else deferred.resolve(res.insertId);
	});
	return deferred.promise;
};



HookObject.prototype.registerRequest = function(req) {
	var self = this;
	return Hook.hit(self).then(function(){
		return Request.create(req, self);
	});
};

HookObject.prototype.checkRequest = function(req){
	return this.rules.reduce(function(acc, rule){
		return acc && rule.checkRequest(req);
	}, true);
};

Hook.getAll = function(){
	var deferred = q.defer();
	db.query("SELECT * FROM `hooks` WHERE 1", function(err,rows){
		if (err)
			deferred.reject(err);
		else
			deferred.resolve(q.all(rows.map(HookObject.prototype.create)));
	});
	return deferred.promise;
};

Hook.getById = function(id){
	var deferred = q.defer();
	if (id === undefined || id === null) {
		deferred.reject(new Error("No id"));
		return deferred.promise;
	}

	db.query("SELECT * FROM `hooks` WHERE `id` = ? LIMIT 1", id, function(err, rows){
		if (err || rows.length != 1)
			deferred.reject(err || new Error("Hook with id not found"));
		else
			deferred.resolve(HookObject.prototype.create(rows[0]));
	});
	return deferred.promise;
};

Hook.getByHash = function(hash){
	var deferred = q.defer();
	if (hash === undefined || hash === null) {
		deferred.reject(new Error("No hash"));
		return deferred.promise;
	}

	db.query("SELECT * FROM `hooks` WHERE `hash` = ? LIMIT 1", hash, function(err, rows){
		if (err || rows.length != 1)
			deferred.reject(err || new Error("Hook with hash not found"));
		else
			deferred.resolve(HookObject.prototype.create(rows[0]));
	});
	return deferred.promise;
};

Hook.hit = function(hook){
	var deferred = q.defer();
	db.query("UPDATE `hooks` SET `lasthit` = NOW() WHERE `id` = ?", hook.id, function(err,rows){
		if (err) deferred.reject(err);
		else deferred.resolve();
	});
	return deferred.promise;
};

Hook.remove = function(hook){
	return hook.removeRules().then(function(hook){
		var deferred = q.defer();
		db.query('DELETE FROM `hooks` WHERE `id` = ?', hook.id, function(err, result){
			if (err) deferred.reject(err);
			else deferred.resolve();
		});
		return deferred.promise;
	});
};

Hook.update = function(hook, obj){
	var deferred = q.defer();
	var err = null;
	if (obj.rules && obj.rules.length === undefined)
		obj.rules = [];

	if (err !== null){
		deferred.reject(err);
		return deferred.promise;
	}
	var query = db.query('UPDATE `hooks` SET ? WHERE `id` = ?', [{name: obj.name || hook.name, buildid: obj.buildid || hook.buildid}, hook.id], function(err, result){
		if (err) deferred.reject(err);
		else deferred.resolve(hook);
	});

	return deferred.promise.then(function(hook){
		return hook.removeRules();
	}).then(function(hook){
		return hook.addRules(obj.rules || []);
	}).then(function(){
		return Hook.getById(hook.id);
	});
};

Hook.create = function(obj){
	var deferred = q.defer();
	var err = null;
	if (obj.name === undefined || obj.name === null)
		err = new Error("No name");
	else if (!obj.rules || !obj.rules.length)
		obj.rules = [];

	if (err !== null){
		deferred.reject(err);
		return deferred.promise;
	}

	db.query('INSERT INTO `hooks` SET ?', { name: obj.name, hash: uuid.v4(), buildid: obj.buildid || null }, function(err,result){
		if (err) deferred.reject(err);
		else {
			Hook.getById(result.insertId).then(function(hook){
				hook.addRules(obj.rules).then(deferred.resolve, deferred.reject);
			}, deferred.reject);
		}
	});

	return deferred.promise;
};

module.exports = Hook;