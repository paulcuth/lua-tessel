



function Logger () {
}




Logger.log = function (message, level) {
	console.log('[' + (level || '') + '] ' + message);
};




module.exports = Logger;