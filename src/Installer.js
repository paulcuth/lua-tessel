/**
 * @fileOverview Installer namespace.
 * Downloads an NPM package, transcodes it to Lua using Colony and creates a tarball.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */


var // Dependencies
	Promise = require('es6-promise').Promise,
	temp = require('temp'),
	tar = require('tar-fs'),
	fs = require('fs-extra'),
	colony = require('colony-compiler'),
	FileFinder = require("node-find-files"),
	npm = require('npm');




/**
 * Namespace for the Installer.
 * @namespace
 */
function Installer () {
}




/**
 * Installs an NPM package to the current directory.
 * Installing involves downloading the package, transcoding it to Lua using Colony,
 * and packing it into a tarball in the current working path.
 * @param {string} npmModuleName Name of the package in the NPM registry.
 * @returns {Promise<Error>} A promise to install.
 */
Installer.install = function (npmPackageName) {
	var _this = this,
		outputFilename = npmPackageName + '.lua.tar';

	return this._createTempFolder()
		.then(function (tmpPath) {
			return _this._downloadPackage(npmPackageName, tmpPath);
		})
		.then(function (packagePath) {
			return _this._transcodePackage(packagePath);
		})
		.then(function (packagePath) {
			return _this._buildTar(packagePath + '/node_modules/' + npmPackageName, outputFilename);
		})
		.catch(function (){
			console.log ('INSTALL ERROR: ', arguments)
		});
};




/**
 * Creates a temporary folder to store JS files before transcoding.
 * @returns {Promise<string|Error>} A promise to return the path ton empty temp folder.
 */
Installer._createTempFolder = function () {

	return new Promise(function (resolve, reject) {
		temp.track();

		temp.mkdir('lua-tessel', function(err, tmpDir) {
			if (err) reject(err);
			resolve(tmpDir);
		});
	});
};




/**
 * Downloads an NPM package.
 * @param {string} name Name of the package in the NPM registry.
 * @param {string} dest Path to which to download.
 * @returns {Promise<string|Error>} A promise to return the path in which the package is installed.
 */
Installer._downloadPackage = function (name, dest) {

	return new Promise(function (resolve, reject) {
		
		npm.load({ loglevel: 'silent' }, function (err, npm) {
			if (err) reject(err);

			npm.prefix = dest;
			npm.commands.install([name], resolve.bind(void 0, dest));
		});
	});		
};




/**
 * Transcodes JavaScript files in a given path to Lua, using Colony.
 * @param {string} path Path to transcode.
 * @returns {Promise<string|Error>} A promise to return the path which has been transcoded.
 */
Installer._transcodePackage = function (path) {
	var _this = this;

	return new Promise(function (resolve, reject) {
		
		var filter = /.js$/,
			finder,
			options = {
				rootFolder: path,
				filterFunction: filter.test.bind(filter)
			};

		finder = new FileFinder(options);

		finder
			.on('complete', resolve.bind(void 0, path))
			.on('error', reject)
			.on('match', _this._transcodeFile)
			.startSearch();
	});
};




/**
 * Transcodes a JavaScript file to Lua, using Colony.
 * @param {string} path Path to the file to be transcoded.
 */
Installer._transcodeFile = function (path) {
	var source, result;

	source = fs.readFileSync(path, 'utf-8');
	result = colony.colonize(source);
	
	fs.writeFileSync(path, result.source);
};




/**
 * Builds a tarball of a given path.
 * @param {string} path Path to tarball.
 * @param {string} outputFilename Filename of the resulting Tarball.
 * @returns {Promise<Error>} A promise to tarball the path.
 */
Installer._buildTar = function (path, outputFilename) {
	return new Promise(function (resolve, reject) {
		var fileStream = fs.createWriteStream(outputFilename);
		tar.pack(path).pipe(fileStream);

		resolve();
	});
};




module.exports = Installer;