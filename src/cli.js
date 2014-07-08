#!/usr/bin/env node

var ConnectionFactory = require('./comms/connection/ConnectionFactory'),
	pathLib = require('path'),

	command = process.argv[2];




function run (bootScript) {
	var path = pathLib.dirname(bootScript),
		script = pathLib.basename(bootScript);

	ConnectionFactory.createUSBConnection()
		.then(function (conn) {
			conn.run(path, script);
		})
		.catch(function (e) {
			console.error(e);
			console.log(e.stack);
		});
}




function flash (bootScript) {
	var path = pathLib.dirname(bootScript),
		script = pathLib.basename(bootScript);

	ConnectionFactory.createUSBConnection()
		.then(function (conn) {
			conn.flash(path, script);
		})
		.catch(function (e) {
			console.error(e);
			console.log(e.stack);
		});
}




switch (command) {
	case 'run':
		run(process.argv[3]);
		break;

	case 'flash':
		flash(process.argv[3]);
		break;

	default: 
		if (command) console.log('Unknown command: ' + command);
		console.log('Usage: lua-tessel <command> <filename>');
		console.log('The only commands available at present are: run, flash');
}



