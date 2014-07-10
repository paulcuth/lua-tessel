


var Promise = require('es6-promise').Promise;



function Connection () {
	this.transport = null;
	this.bundler = null;
	this.logger = null;
}


Connection.TAG_KILL = 0x10;
Connection.TAG_FLASH = 0x0050;
Connection.TAG_RUN = 0x0055;




Connection.prototype.init = function (config) {
	this.transport = config.transport || this.transport;
	this.bundler = config.bundler || this.bundler;
	this.logger = config.logger || this.logger;

	this.transport
		.on('debug', this._handleDebugMessage.bind(this))
		.on('message', this._handleMessage.bind(this));
};




Connection.prototype._handleDebugMessage = function (message, logLevel) {
	if (this.logger) this.logger.log(message, logLevel);
};




Connection.prototype._handleMessage = function (tag, buffer) {
	// todo
};




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




Connection.prototype.stop = function () {
	return this.transport.send(Connection.TAG_KILL, new Buffer(0));
};




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




Connection.prototype.erase = function () {
	var _this = this;

	// return new Promise(function (resolve) {
	// 	resolve(_this.transport.send(Connection.TAG_FLASH, new Buffer([0xff, 0xff, 0xff, 0xff])));
	// });
	return this.stop()
		.then(function () {
			return _this.transport.send(Connection.TAG_FLASH, new Buffer([0xff, 0xff, 0xff, 0xff]));
		});
};




Connection.prototype.close = function () {
	return this.transport.close();
};




module.exports = Connection;

