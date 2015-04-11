var express = require('express');
var exphbs  = require('express-handlebars');
var conf = require('./config.json');
var mysql = require('mysql');

var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

var db = mysql.createConnection(conf.mysql);
db.connect(function(err){
	if (err){
		console.error('error connecting: ' + err.stack);
		process.exit(1);
	}
	app.locals.db = db;
});

app.get('/', function (req, res) {
	res.render('home');
});

app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));
app.use('/jquery', express.static('node_modules/jquery/dist'));
app.use('/js', express.static('assets/js'));
app.use('/css', express.static('assets/css'));

var server = app.listen(conf.port, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});