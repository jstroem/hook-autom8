var express = require('express');
var exphbs = require('express-handlebars');
var moment = require('moment');
var https = require('https');
var conf = require('./config.json');
var session = require('express-session');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

var auth = require('./routes/auth.js');
var hooks = require('./routes/hooks.js');
var builds = require('./routes/builds.js');
var requests = require('./routes/requests.js');
var logs = require('./routes/logs.js');

var User = require('./models/user.js');

var app = express();
app.engine('handlebars', exphbs({
	defaultLayout: 'main',
	helpers: {
		JSON: function(obj) {
			return JSON.stringify(obj, null, 2);
		},
		formatDate: function(timestamp) {
			return moment(timestamp).format('MM/DD/YYYY');
		},
		formatDateTime: function(timestamp) {
			return moment(timestamp).format('MM/DD/YYYY HH:mm:ss');
		},
		ifCond: function(v1, operator, v2, options) {
			switch (operator) {
				case '==':
					return (v1 == v2) ? options.fn(this) : options.inverse(this);
				case '===':
					return (v1 === v2) ? options.fn(this) : options.inverse(this);
				case '<':
					return (v1 < v2) ? options.fn(this) : options.inverse(this);
				case '<=':
					return (v1 <= v2) ? options.fn(this) : options.inverse(this);
				case '>':
					return (v1 > v2) ? options.fn(this) : options.inverse(this);
				case '>=':
					return (v1 >= v2) ? options.fn(this) : options.inverse(this);
				case '&&':
					return (v1 && v2) ? options.fn(this) : options.inverse(this);
				case '||':
					return (v1 || v2) ? options.fn(this) : options.inverse(this);
				default:
					return options.inverse(this);
			}
		}
	}
}));
app.set('view engine', 'handlebars');
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

function errorHandler(err, req, res, next) {
	res.status(500);
	res.render('error', {
		error: err
	});
}

app.use(errorHandler);

app.use(session({
	secret: 's9Pq5EZwWUpQKUYu7sDq9H6vqjrQGDwwSPn9bX7WkDPxEFkMwDzMFxaLN2x7WZ9JWC73JFDF',
	resave: false,
	saveUninitialized: false
}));

app.use('/angular/angular.js', express.static('node_modules/angular/angular.js'));
app.use('/angular/angular.min.js', express.static('node_modules/angular/angular.min.js'));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/jquery', express.static('node_modules/jquery/dist'));
app.use('/js', express.static('assets/js'));
app.use('/css', express.static('assets/css'));

app.get('/', auth.ensure, hooks.list);
app.get('/hooks', auth.ensure, hooks.list);
app.get('/hooks/create', auth.ensure, hooks.createForm);
app.post('/hooks/create', auth.ensure, hooks.create);
app.get('/hooks/:id/edit', auth.ensure, hooks.editForm);
app.post('/hooks/:id/edit', auth.ensure, hooks.edit);
app.get('/hooks/:id/remove', auth.ensure, hooks.removeForm);
app.post('/hooks/:id/remove', auth.ensure, hooks.remove);
app.get('/hooks/:id/requests/:page?', auth.ensure, hooks.requests);
app.get('/hooks/:id/logs/:page?', auth.ensure, hooks.logs);

app.get('/requests', auth.ensure, requests.list);
app.get('/requests/:id', auth.ensure, requests.view);

app.get('/logs', auth.ensure, logs.list);
app.get('/logs/:id', auth.ensure, logs.view);

app.get('/builds', auth.ensure, builds.list);
app.get('/builds/create', auth.ensure, builds.createForm);
app.post('/builds/create', auth.ensure, builds.create);
app.get('/builds/:id/remove', auth.ensure, builds.removeForm);
app.post('/builds/:id/remove', auth.ensure, builds.remove);
app.get('/builds/:id/edit', auth.ensure, builds.editForm);
app.post('/builds/:id/edit', auth.ensure, builds.edit);
app.get('/builds/:id/logs/:page?', auth.ensure, builds.logs);

app.all('/inbound/:hash', hooks.inbound);

app.get('/login', auth.loginForm);
app.post('/login', auth.login);
app.all('/logout', auth.logout);


if (config.ssl) {
	var options = {
		key: fs.readFileSync(options.key),
		cert: fs.readFileSync(options.cert),
	};
	var server = https.createServer(options, app).listen(conf.port, function() {
		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);
	});
} else {
	var server = app.listen(conf.port, function() {

		var host = server.address().address;
		var port = server.address().port;

		console.log('Example app listening at http://%s:%s', host, port);

	});
}