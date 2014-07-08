

var usb = require('usb'),
	Promise = require('es6-promise').Promise,

	AbstractTransport = require('./AbstractTransport'),

	TESSEL_VID = 0x1d50,
	TESSEL_PID = 0x6097,

	VENDOR_REQ_OUT = usb.LIBUSB_REQUEST_TYPE_VENDOR | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_OUT,
	VENDOR_REQ_IN  = usb.LIBUSB_REQUEST_TYPE_VENDOR | usb.LIBUSB_RECIPIENT_DEVICE | usb.LIBUSB_ENDPOINT_IN,

 	REQ_KILL = 0x10,

	TRANSFER_SIZE = 4096;




function USBTransport (config) {
	this._device = null;
	this.deviceSerial = null;
	this._endpoints = {};
}


USBTransport.prototype = Object.create(AbstractTransport.prototype);
USBTransport.prototype.constructor = USBTransport;




USBTransport.getDevices = function () {
	return usb.getDeviceList().filter(function (device) {
		if (
			device.deviceDescriptor.idVendor == TESSEL_VID 
			&& device.deviceDescriptor.idProduct == TESSEL_PID
			&& device.deviceDescriptor.bcdDevice >> 8 != 0 	// Exclude devices in bootloader mode
		) {
			return device;
		}
	});
};




USBTransport.getFirstDevice = function () {
	var devices = this.getDevices();
	if (!devices.length) throw new Error('No Tessel devices found');

	return devices[0];
};





USBTransport.prototype.init = function () {
	var _this = this;

	this._closeListener = this.close.bind(this);

	return new Promise(function (resolve, reject) {
		try {
			_this._device = _this.constructor.getFirstDevice();
		} catch (e) {
			reject(e);
		}

		_this._device.open();
		_this._device.timeout = 10000;

		resolve(
			Promise.all([
				_this._getDeviceSerial(), 
				_this._getDeviceInterface()
			])
			.then(function (serial) { 
				_this.emit('debug', 'Connected to device ' + serial);
				process.on('exit', _this._closeListener);

				return _this; 
			})
		);

	});
};




USBTransport.prototype._getDeviceSerial = function () {
	var _this = this,
		device = this._device;

	return new Promise(function (resolve, reject) {
		device.getStringDescriptor(device.deviceDescriptor.iSerialNumber, function (err, serialNumber) {
			if (err) return reject(err);
			resolve(_this.deviceSerial = serialNumber);
		});
	});
};




USBTransport.prototype._getDeviceInterface = function () {
	var _this = this,
		device = this._device,
		endpoints = this._endpoints;

	return new Promise(function (resolve, reject) {
		var interface = _this._interface = device.interface(0);

		try {
			interface.claim();
		} catch (e) {
			if (e.message === 'LIBUSB_ERROR_BUSY') reject(new Error('Device is in use by another process'));
			reject(e);
		}

		interface.setAltSetting(1, function (err) {
			if (err) reject(err);

			endpoints.log = interface.endpoints[0];
			endpoints.messagesIn = interface.endpoints[1];
			endpoints.messagesOut = interface.endpoints[2];
			
			_this._initEndpoints();
			resolve();
		});
	});
};




USBTransport.prototype._initEndpoints = function () {
	return Promise.all([
		this._initLogEndpoint(), 
		this._initMessageInEndpoint(), 
		this._initMessageOutEndpoint()
	]);
};




USBTransport.prototype._initLogEndpoint = function () {
	var _this = this,
		endpoint = this._endpoints.log;

	endpoint.startStream(4, TRANSFER_SIZE);
	
	endpoint.on('data', function (data) {
		var pos = 0,
			logLevel, message,
			i, l;
		
		while (pos < data.length) {
			if (data[pos] !== 1) throw new Error('Expected STX at ' + pos + ', got ' + data[pos] + 'instead');
			logLevel = data[pos + 1];

			for (var i = pos + 2, l = data.length; i < l; i++) {
				if (data[i] === 1) break;
			}

			message = data.toString('utf8', pos + 2, i);
			_this.emit('debug', message, logLevel);

			pos = i;
		}
	});

	endpoint.on('error', function (e) {
		throw new Error('Error reading USB log endpoint: ' + e.message);
	});
};




USBTransport.prototype._initMessageInEndpoint = function () {
	var _this = this,
		endpoint = this._endpoints.messagesIn,
		buffers = [];

	
	endpoint.startStream(2, TRANSFER_SIZE);

	endpoint.on('data', function (data) {
		var buffer, tag, length;

		buffers.push(data);

		if (data.length < TRANSFER_SIZE) {
			buffer = Buffer.concat(buffers);

			if (buffer.length > 0) {
				length = buffer.readUInt32LE(0);
				tag = buffer.readUInt32LE(4);
				buffer = buffer.slice(8);

				_this.emit('message', tag, buffer);
			}

			buffers.length = 0;

		} else if (buffers.length * TRANSFER_SIZE > 32 * 1024 * 1024) {
			// The message wouldn't fit in Tessel's memory. It probably didn't mean to send this...
			throw new Error("Malformed message (oversize): " + buffers[0].toString('hex', 0, 8))
		}
	});

	endpoint.on('error', function (e) {
		throw new Error('Error reading USB message endpoint: ' + e.message);
	});
};




USBTransport.prototype._initMessageOutEndpoint = function () {
		//TODO
};




USBTransport.prototype.postMessage = function (tag, data) {
	var _this = this,
		header = new Buffer(8),
		payload;

	data = data || new Buffer(0);

	header.writeUInt32LE(data.length, 0);
	header.writeUInt32LE(tag, 4);

	payload = Buffer.concat([header, data]);

	return new Promise(function (resolve, reject) {
		_this._endpoints.messagesOut.transferWithZLP(payload, function (err) {
			if (err) reject(err);
			resolve();
		});
	});
};




USBTransport.prototype.close = function () {
	var _this = this;

	return new Promise(function (resolve) {
		_this._device.controlTransfer(VENDOR_REQ_OUT, REQ_KILL, 0, 0, new Buffer(0), function () {
			// process.removeListener('exit', _this._closeListener);
			// resolve();
		});


		process.removeListener('exit', _this._closeListener);
		
		if (_this._device) _this._device.close();
		if (!_this._interface) resolve();

		_this._interface.release(true, function (err) {
			_this._interface = null;
			resolve();
		});

	});
};




module.exports = USBTransport;
