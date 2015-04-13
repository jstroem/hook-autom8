var mysql = require('mysql');
var conf = require('./config.json');
var conn = null;

module.exports = (function(){
  if (conn)
    return conn;

  conn = mysql.createConnection(conf.mysql);
  conn.connect(function(err){
    if (err) {
      throw new Error(err);
    }
  });
  return conn;
})();