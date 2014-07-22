/**
 * @fileOverview Bundler namespace.
 * Bundles a directory so that it can be deployed to a Tessel.
 * @author <a href="mailto:lua-tessel@paulcuth.me.uk">Paul Cuthbertson</a>
 */


var // External dependencies
	Promise = require('es6-promise').Promise,
	pathLib = require('path'),
	tar = require('tar'),
	tarfs = require('tar-fs'),
	temp = require('temp'),
	fstream = require('fstream'),
	FileFinder = require("node-find-files"),
	Promise = require('es6-promise').Promise,
	fs = require('fs-extra');




/**
 * Namespace for the Bundler.
 * @namespace
 */
function Bundler () {
}




/**
 * Bundles a path.
 * @param {string} path Path to the directory to bundle.
 * @param {string} bootScript The Lua file to execute.
 * @param {RegExp} filter A filter to apply to filename in the path.
 * @returns {Promise<Buffer|Error>} A promise to return a buffer containing the deploy.
 */
Bundler.bundle = function (path, bootScript, filter) {
	var _this = this,
		bootMod = bootScript.replace(/\.lua$/, '').replace(/\//g, '.');

	return this._createTempFolder()
		.then(function (tmpDir) {
			return _this._assembleBootstrap(tmpDir, bootMod);
		})
		.then(function (tmpDir) {
			return _this._assembleUserFiles(path, tmpDir, filter);
		})
		.then(this._buildTar)
		.catch(function () {
			console.log ('BUNDLE ERROR', arguments);
		});
}




/**
 * Creates a temporary folder to store the files before bundling.
 * @returns {Promise<string|Error>} A promise to return the path of an empty temp folder.
 */
Bundler._createTempFolder = function () {

	return new Promise(function (resolve, reject) {
		temp.track();

		temp.mkdir('lua-tessel', function(err, tmpDir) {
			if (err) reject(err);
			resolve(tmpDir);
		});
	});
}




/**
 * Copies the bootstrap files that are required to execute the bundle.
 * @param {string} dest Path into which to copy the bootstrap files.
 * @param {string} bootModule Module path to the executable file.
 * @returns {Promise<string|Error>} A promise to return the folder that contains the bootstrap.
 */
Bundler._assembleBootstrap = function (dest, bootModule) {

	return new Promise(function (resolve, reject) {
		// Read template
		fs.readFile(__dirname + '/template/_start.js', function (err, data) {
			if (err) reject(err);

			// Set boot module (user script entry point)
			data = data.toString().replace('{{boot_mod}}', bootModule);

			// Write to temp path
			fs.writeFile(dest + '/_start.js', data, function (err) {
				if (err) reject(err);

				// Create app folder
				fs.mkdir(dest + '/app', function (err) {
					if (err) reject(err);
					resolve(dest);
				});
			});		
		});
	});		
}




/**
 * Copies the user files to be bundled.
 * @param {string} source Path to the user's files.
 * @param {string} dest Path into which to copy the user's files.
 * @param {RegExp} filter Filter to apply to files in the source path.
 * @returns {Promise<string|Error>} A promise to return the folder that contains the files.
 */
Bundler._assembleUserFiles = function (source, dest, filter) {
	var _this = this;

	return new Promise(function (resolve, reject) {

		var filter = filter || /\.(lua|txt|dat)$/,
			modFileFilter = /\.lua\.tar$/,
			modulePromises = [],
			finder,
			options = {
				rootFolder: source,
				filterFunction: function () { return true; }
			};

		finder = new FileFinder(options);

		finder
			.on('complete', function () {
				Promise.all(modulePromises).then(resolve.bind(void 0, dest));
			})
			.on('error', reject)
			.on('match', function (path) {
				var appPath = '/app/' + pathLib.relative(source, path);

				if (modFileFilter.test(path)) {
					var outstream = tarfs.extract(dest + appPath.substr(0, appPath.length - 8)),
						promise = new Promise(function (resolve) {
							outstream.on('finish', resolve);
							fs.createReadStream(path).pipe(outstream);
						});

					modulePromises.push(promise);

				} else if (filter.test(path)) {
					fs.copySync(path, dest + appPath);
				}
			})
			.startSearch();

	});
};




/**
 * Builds a tarball of a given path.
 * @param {string} path Path to tarball.
 * @returns {Promise<Buffer|Error>} A promise to return a buffer containing a deployable tarball.
 */
Bundler._buildTar = function (path) {
	return new Promise(function (resolve, reject) {
		// This must be a "directory"
		var reader = fstream.Reader({ path: path, type: "Directory", basename: '' }),
			tarStream = tar.Pack({ noProprietary: true }),
			entries = [],
			pipe;

		reader.on('entry', function (entry) {
			entry.root = { path: entry.path };
		});

		reader.on('error', function (err) {
			reject(err);
		});


		pipe = reader.pipe(tarStream);

		pipe.on('data', function (buffer) {
			entries.push(buffer);
		});

		pipe.on('end', function () {
			var buffer = Buffer.concat(entries);

			tarStream.write(buffer);
			tarStream.end();

			resolve(buffer);
		});

	});
}




module.exports = Bundler;