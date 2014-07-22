#!/usr/bin/env node
/**
 * @fileOverview The lua-tessel command line interface.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */

var // External dependencies
	pathLib = require('path'),

	// Local dependencies
	ConnectionFactory = require('./comms/connection/ConnectionFactory'),
	Installer = require('./Installer'),


	// Static
	command = process.argv[2];




/**
 * The run command.
 * Runs a given Lua script on the Tessel. The script and all other files and folders 
 * in the same path will be bundled with the script.
 * @param {string} bootScript The path to the file that will be executed once deployed.
 */
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




/**
 * The push command.
 * Flashes a given Lua script to the Tessel. The script and all other files and folders 
 * in the same path will be bundled with the script.
 * @param {string} bootScript The path to the file that will be flashed.
 */
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




/**
 * The erase command.
 * Erases whatever was flashed to the Tessel.
 */
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




/**
 * The install command.
 * Creates a Lua module from a given NPM package.
 * @param {string} npmPackageName Name of the NPM package in the registry.
 */
function install (npmPackageName) {
	Installer.install(npmPackageName);
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

	case 'install':
		install(process.argv[3]);
		break;

	default: 
		if (command) console.log('Unknown command: ' + command);
		console.log('Usage: lua-tessel <command> <filename>');
		console.log('The only commands available at present are: run, push, erase, install');
}

