


var Promise = require('es6-promise').Promise,

	Connection = require('./Connection'),
	USBTransport = require('../transport/USBTransport');
	Bundler = require('../Bundler'),
	Logger = require('../../logger/Logger');




function createUSBConnection (logger) {
	var conn = new Connection(),
		transport = new USBTransport(),
		bundler = Bundler,
		logger = Logger;
	
	return transport.init().then(function (transport) {
		conn.init({
			transport: transport,
			bundler: bundler,
			logger: logger
		})

		return conn;
	});

	// For testing without Tessel device:
	// return new Promise(function (resolve, reject) {
	// 	conn.init({
	// 		transport: transport,
	// 		bundler: bundler,
	// 		logger: logger
	// 	})

	// 	resolve(conn);
	// });

}



module.exports = {
	createUSBConnection: createUSBConnection
};

