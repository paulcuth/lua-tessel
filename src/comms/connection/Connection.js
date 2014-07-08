

var Promise = require('es6-promise').Promise,
	
	// Tags
	TAG_WIFI_CHECK = 0x0043,
	TAG_WIFI_ERASE = 0x0044,
	TAG_PING = 0x0047,
	TAG_MESSAGE_WRITE = 0x004d,
	TAG_FLASH = 0x0050,
	TAG_RUN = 0x0055,
	TAG_WIFI_SEARCH = 0x0056,
	TAG_WIFI_CONNECT = 0x0057,
	TAG_WIFI_DISCONNECT = 0x0059,
	TAG_STDIN_WRITE = 0x006e,
	TAG_ENTER_BOOTLOADER = 0x0042;




function Connection () {
	this.transport = null;
	this.bundler = null;
	this.logger = null;
}




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
	var _this = this;

	return this.bundler.bundle(path, script, filter).then(function (bundle) {
		return _this.transport.postMessage(TAG_RUN, bundle);
	});
};




Connection.prototype.flash = function (path, script, filter) {
	var _this = this;

	return this.bundler.bundle(path, script, filter).then(function (bundle) {
		return _this.transport.postMessage(TAG_FLASH, bundle);
	});
};




Connection.prototype.erase = function () {
	var _this = this;

	return new Promise(function (resolve) {
		resolve(_this.transport.postMessage(TAG_FLASH, new Buffer([0xff, 0xff, 0xff, 0xff])));
	});
};




Connection.prototype.wifiConnect = function (ssid, pass, security) {
	var buffer = new Buffer(128);
	
	buffer.fill(0);
	ssid.copy(buffer, 0, 0, ssid.length);
	pass.copy(buffer, 32, 0, pass.length)
	security.copy(buffer, 96, 0, security.length);

	return this.transport.postMessage(TAG_WIFI_CONNECT, buffer);
};




Connection.prototype.wifiDisconnect = function (ssid, pass, security) {
	var buffer = new Buffer(4);
	return this.transport.postMessage(TAG_WIFI_DISCONNECT, buffer);
};




Connection.prototype.wifiDisconnect = function (ssid, pass, security) {
	var buffer = new Buffer('erase');
	return this.transport.postMessage(TAG_WIFI_ERASE, buffer);
};




module.exports = Connection;

