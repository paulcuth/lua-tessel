/**
 * @fileOverview Message logger.
 * Currently a simple logger that outputs every message it receives.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */




/**
 * Namespace for the Logger.
 * @namespace
 */
function Logger () {
}




/**
 * Log a message.
 * @param {string} message Message string.
 * @param {number} level Weight of the message.
 */
Logger.log = function (message, level) {
	console.log('[' + (level || '') + '] ' + message);
};




module.exports = Logger;