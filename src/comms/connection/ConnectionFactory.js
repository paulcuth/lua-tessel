/**
 * @fileOverview Connection factory.
 * Creates connection to Tessel devices via a chosen transport.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */


var // External dependencies
	Promise = require('es6-promise').Promise,

	// Local dependencies
	Connection = require('./Connection'),
	USBTransport = require('../transport/USBTransport');
	Bundler = require('../../Bundler'),
	Logger = require('../../logger/Logger');




/**
 * Creates a new connection to a Tessel device via USB.
 * @static
 * @returns {Array<Connection>} A promise to return a connection object.
 */
function createUSBConnection () {
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

