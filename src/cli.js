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




function push (bootScript) {
	var path = pathLib.dirname(bootScript),
		script = pathLib.basename(bootScript),
		_conn;

	ConnectionFactory.createUSBConnection()
		.then(function (conn) {
			_conn = conn;
			return conn.push(path, script);
		})
		.then(function () {
			return _conn.close();
		})
		.catch(function (e) {
			console.error(e);
			console.log(e.stack);
		});
}




function erase () {
	var _conn;

	ConnectionFactory.createUSBConnection()
		.then(function (conn) {
			_conn = conn;
			return conn.erase();
		})
		.then(function () {
			return _conn.close();
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

	case 'push':
		push(process.argv[3]);
		break;

	case 'erase':
		erase();
		break;

	default: 
		if (command) console.log('Unknown command: ' + command);
		console.log('Usage: lua-tessel <command> <filename>');
		console.log('The only commands available at present are: run, push, erase');
}



