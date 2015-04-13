var Build = require('./../models/build.js');
var Log = require('./../models/log.js');

var routes = {};

routes.list = function(req,res, next){
	Build.getAll().then(function(builds){
		res.render('builds-list', {builds: builds});
	}, next);
};

routes.createForm = function(req,res){
	res.render('builds-create');
};

routes.create = function(req,res,next){
	Build.create(req.body).then(function(){
		res.redirect('/builds');
	},next);
};

routes.removeForm = function(req, res, next){
	Build.getById(req.params.id).then(function(build){
		res.render('builds-remove', { build: build });
	}, next);
};

routes.remove = function(req,res,next){
	Build.getById(req.params.id).then(function(build){
		return Build.remove(build);
	}).then(function(){
		res.redirect('/builds');
	}).catch(next);
};

routes.editForm = function(req,res, next){
	Build.getById(req.params.id).then(function(build){
		res.render('builds-edit', { build: build });
	}, next);
};

routes.logs = function(req,res,next){
	Build.getById(req.params.id).then(function(build){
		return Log.getByBuildId(build.id, req.params.page);
	}).then(function(logs){
		res.render('logs-list', { logs: logs });
	}).catch(next);
};

routes.edit = function(req,res,next){
	Build.getById(req.params.id)
	.then(function(build) {
		return Build.update(build, req.body);
	})
	.then(function(build){
		res.redirect('/builds');
	}).catch(next);
};

exports = module.exports = routes;