var Log = require('./../models/log.js');

var routes = {};

routes.list = function(req,res, next){
	Log.getAll(req.query.page).then(function(logs){
		res.render('logs-list', {logs: logs});
	}, next);
};

routes.view = function(req,res,next){
	Log.getById(req.params.id).then(function(obj){
		res.render('logs-view', {js: [{src: '/js/logs-view.js'}], log: obj.log, hook: obj.hook, build: obj.build});
	}, next);
};

exports = module.exports = routes;