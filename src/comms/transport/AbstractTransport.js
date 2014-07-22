/**
 * @fileOverview Abstract transport class.
 * A transport is a means of communicating with a Tessel device.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */


var // Dependencies
	EventEmitter = require('events').EventEmitter;




/**
 * An abstract mode of transport.
 * @constructor
 * @extends EventEmitter
 */
function AbstractTransport () {
}


AbstractTransport.prototype = Object.create(EventEmitter.prototype);
AbstractTransport.prototype.constructor = AbstractTransport;




/**
 * Initialises the transport layer.
 */
AbstractTransport.prototype.init = function () {
	throw new Error('Abstract init() method should be overwritten in implementation #<' + this.constructor.name + '>');
};




/**
 * Sends a message over the transport layer
 * @param {number} tag Unique reference to the type of message.
 * @param {Buffer} data Data to send.
 */
AbstractTransport.prototype.send = function (tag, data) {
	throw new Error('Abstract send() method should be overwritten in implementation #<' + this.constructor.name + '>');
};




/**
 * Ends communication through the transport layer.
 */
AbstractTransport.prototype.close = function () {
	throw new Error('Abstract close() method should be overwritten in implementation #<' + this.constructor.name + '>');
};




module.exports = AbstractTransport;
