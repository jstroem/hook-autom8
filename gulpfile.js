var gulp = require('gulp');
var gls = require('gulp-live-server');

gulp.task('serve', function(){
	var server = gls('index.js', {env: {NODE_ENV: 'development'}});
    server.start();
    gulp.watch(['*.js', 'routes/*.js', 'models/*.js'], server.start);

});