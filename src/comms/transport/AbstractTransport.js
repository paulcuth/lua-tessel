

var EventEmitter = require('events').EventEmitter;




function _notOverwrittenError () {
	throw new Error('Abstract method should be overwritten in implementation #<' + this.constructor.name + '>');
}




function AbstractTransport () {
}


AbstractTransport.prototype = Object.create(EventEmitter.prototype);
AbstractTransport.prototype.constructor = AbstractTransport;




AbstractTransport.prototype.postMessage = _notOverwrittenError;




module.exports = AbstractTransport;
