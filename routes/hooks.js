var Hook = require('./../models/hook.js');
var Build = require('./../models/build.js');
var Request = require('./../models/request.js');
var Log = require('./../models/log.js');

var routes = {};

routes.list = function(req,res, next){
	Hook.getAll().then(function(hooks){
		res.render('hooks-list', {hooks: hooks});
	}, next);
};

routes.createForm = function(req,res,next){
	Build.getAll().then(function(builds){
		res.render('hooks-create', { js: [{src:'/js/hooks-form.js'}], builds: builds});
	}, next);
};

routes.create = function(req,res,next){
	Hook.create(req.body).then(function(){
		res.redirect('/hooks');
	},next);
};


routes.editForm = function(req,res, next){
	Hook.getById(req.params.id).then(function(hook){
		Build.getAll().then(function(builds){
			res.render('hooks-edit', { js: [{src:'/js/hooks-form.js'}], hook: hook, builds: builds });
		}, next);
	}, next);
};

routes.edit = function(req,res,next){
	Hook.getById(req.params.id)
	.then(function(hook) {
		return hook.update(req.body);
	})
	.then(function(hook){
		res.redirect('/hooks');
	}).catch(next);
};

routes.removeForm = function(req, res, next){
	Hook.getById(req.params.id).then(function(hook){
		res.render('hooks-remove', { hook: hook });
	}, next);
};

routes.remove = function(req,res,next){
	Hook.getById(req.params.id).then(function(hook){
		return hook.remove();
	}).then(function(){
		res.redirect('/hooks');
	}).catch(next);
};

routes.requests = function(req,res,next){
	Hook.getById(req.params.id).then(function(hook){
		return hook.getRequests(req.params.page);
	}).then(function(requests ){
		res.render('requests-list', { requests: requests });
	}).catch(next);
};

routes.logs = function(req,res,next){
	Hook.getById(req.params.id).then(function(hook){
		return Log.getByHookId(hook.id, req.params.page);
	}).then(function(logs){
		res.render('logs-list', { logs: logs });
	}).catch(next);
};

routes.inbound = function(req,res, next){
	var hook = null;
	var requestId = null;
	Hook.getByHash(req.params.hash).then(function(h){
		hook = h;
		return hook.registerRequest(req);
	}).then(function(rid){
		requestId = rid;
		if (hook.checkRequest(req)) {
			res.status(200).end();
			hook.runBuild(req).then(function(arr){
				var context = arr[0], result = arr[1];
				return hook.registerBuildSuccess(requestId, context, result);
			}, function(err){
				return hook.runError(req, err).then(function(arr){
					var eContext = arr[0], eResult = arr[1];
					return hook.registerBuildFailed(requestId, err, eContext, eResult);
				}, function(err2){
					return hook.registerBuildErrorFailed(requestId, err, err2);
				});
			}).then(function(logid){
				return Request.setLogId(requestId, logid);
			}).then(function(){
				return Build.registerRun(hook.buildid);
			}).catch(function(err){
				hook.registerBuildFailed(requestId, err, null, null).then(function(logid){
					Request.setLogId(requestId, logid).then(function(){
						Build.registerRun(hook.buildid);
					});
				});
			});
		} else {
			res.status(404).end();
		}
	}).catch(next);
};

exports = module.exports = routes;