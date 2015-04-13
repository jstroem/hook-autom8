var fake_err = "\
f () {\n\
    errcode=$?\n\
    echo '_F4LURR3'\n\
}\n\
trap f ERR\n";

var StatefulProcessCommandProxy = require('stateful-process-command-proxy');
var q = require('q');

var handleResult = function(self, deferred) {
	return function(cmdResult){
		if (cmdResult.stdout.indexOf('_F4LURR3')>=0){
			cmdResult.stdout = cmdResult.stdout.substr(0, cmdResult.stdout.indexOf('_F4LURR3'));
			deferred.reject(cmdResult);
		} else {
			deferred.resolve(cmdResult);
		}
	};
};

var handleError = function(self, deferred) {
	return function(error){
		deferred.reject(error);
	};
};

var Shell = function(){
	this.proxy = new StatefulProcessCommandProxy({
		name: "Command Runner",

		processCommand: '/bin/bash',
		processArgs: ['-s'],
		processRetainMaxCmdHistory: 10,

		logFunction: function(severity,origin,msg) {
			
		},

		processCwd: './',
		processUid: null,
		processGid: null,
	});
};

Shell.prototype.init = function(){
	var deferred = q.defer();
	this.proxy.executeCommand(fake_err).then(function(){
		deferred.resolve(null);
	}, deferred.reject);
	return deferred.promise;
};

Shell.prototype.exec = function(cmd){
	var deferred = q.defer();
	this.proxy.executeCommand(cmd).then(handleResult(this, deferred), handleError(this, deferred));
	return deferred.promise;
};

Shell.prototype.close = function(){
	this.proxy.shutdown();
};



exports = module.exports = Shell;