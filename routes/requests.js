var Request = require('./../models/request.js');

var routes = {};

routes.list = function(req,res, next){
	Request.getAll(req.query.page).then(function(requests){
		res.render('requests-list', {requests: requests});
	}, next);
};

routes.view = function(req,res,next){
	Request.getById(req.params.id).then(function(request){
		res.render('requests-view', {request: request});
	}, next);
};

exports = module.exports = routes;