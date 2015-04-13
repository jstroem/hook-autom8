var User = require('./../models/user.js');
var sha1 = require('./../sha1.js');

var routes = {};

routes.loginForm = function(req,res){
	res.render('login');
};

routes.login = function(req,res){
	console.log(req.body.username, req.body.password);
	User.FindByUsername(req.body.username).then(function(user){
	    if (user.password != sha1(req.body.password)) { 
	    	return res.render('login', {error: true}); 
	    } else {
	    	req.session.userid = user.id;
	    	res.redirect('/');
	    }
	}, function(err){
	  	return res.render('login', {error: true});
	});
}

routes.logout = function(req,res){
	delete req.session.userid;
	res.redirect('/login');
}

routes.ensure = function(req,res,next){
	if (req.session.userid === undefined) {
		res.redirect('/login');
		return;
	}

	User.FindById(req.session.userid).then(function(user){
		req.user = user;
		next();
	}, function(err){
		res.redirect('/login');
	});
};

exports = module.exports = routes;