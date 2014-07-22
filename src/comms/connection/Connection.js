/**
 * @fileOverview A connection to a Tessel device.
 * A connection is agnostic to the transport used.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */


var // External dependencies
	Promise = require('es6-promise').Promise;



/**
 * A Connection to a Tessel device.
 * @constructor
 */
function Connection () {
	this.transport = null;
	this.bundler = null;
	this.logger = null;
}


// Static constants
Connection.TAG_KILL = 0x10;
Connection.TAG_FLASH = 0x0050;
Connection.TAG_RUN = 0x0055;




/**
 * Initialises the connection.
 * @param {Object} config Configuration to be applied to the connection.
 */
Connection.prototype.init = function (config) {
	this.transport = config.transport || this.transport;
	this.bundler = config.bundler || this.bundler;
	this.logger = config.logger || this.logger;

	this.transport
		.on('debug', this._handleDebugMessage.bind(this))
		.on('message', this._handleMessage.bind(this));
};




/**
 * Event handler for incoming debug messages.
 * @param {string} message Log message.
 * @param {number} logLevel Weight of the message.
 */
Connection.prototype._handleDebugMessage = function (message, logLevel) {
	if (this.logger) this.logger.log(message, logLevel);
};




/**
 * Event handler for incoming interface messages.
 * @param {number} tag Unique reference to the type of message.
 * @param {Buffer} data Data received.
 */
Connection.prototype._handleMessage = function (tag, buffer) {
	// todo
};




/**
 * Creates and deploys a bundle to run on the Tessel.
 * @param {string} path Path to bundle.
 * @param {string} script Script to execute.
 * @param {RegExp} [filter] Filter for files in the source path.
 * @returns {Promise<Buffer|Error>} A promise to return data in the Tessel's response.
 */
Connection.prototype.run = function (path, script, filter) {
	var _this = this,
		_bundle;

	process.on('SIGINT', function () {
		_this.stop().then(function () {
			process.exit(0);
		});
	});

	return this.bundler.bundle(path, script, filter)
		.then(function (bundle) {
			_bundle = bundle;
			return _this.stop();
		})
		.then(function () {
			return _this.transport.send(Connection.TAG_RUN, _bundle);
		});
};




/**
 * Stops execution of whatever is running on the Tessel.
 * @returns {Promise<Buffer|Error>} A promise to return data in the Tessel's response.
 */
Connection.prototype.stop = function () {
	return this.transport.send(Connection.TAG_KILL, new Buffer(0));
};




/**
 * Creates and deploys a bundle to be flashed to the Tessel.
 * @param {string} path Path to bundle.
 * @param {string} script Script to execute.
 * @param {RegExp} [filter] Filter for files in the source path.
 * @returns {Promise<Buffer|Error>} A promise to return data in the Tessel's response.
 */
Connection.prototype.push = function (path, script, filter) {
	var _this = this,
		_bundle;

	return this.bundler.bundle(path, script, filter)
		.then(function (bundle) {
			_bundle = bundle;
			return _this.stop();
		})
		.then(function () {
			return _this.transport.send(Connection.TAG_FLASH, _bundle);
		});
};




/**
 * Erased the flash memory on the Tessel.
 * @returns {Promise<Buffer|Error>} A promise to return data in the Tessel's response.
 */
Connection.prototype.erase = function () {
	var _this = this;

	return this.stop()
		.then(function () {
			return _this.transport.send(Connection.TAG_FLASH, new Buffer([0xff, 0xff, 0xff, 0xff]));
		});
};




/**
 * Closes the connection.
 * @returns {Promise<Buffer|Error>} A promise to close the connection.
 */
Connection.prototype.close = function () {
	return this.transport.close();
};




module.exports = Connection;

