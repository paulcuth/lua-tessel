

var Promise = require('es6-promise').Promise,
	tar = require('tar'),
	temp = require('temp'),
	fstream = require('fstream'),
	fs = require('fs-extra');




function Bundler () {
}




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
		.then(this._buildTar);

	// return this._assembleBundle(path, bootScript, filter).then(this._buildTar);
}




Bundler._createTempFolder = function () {

	return new Promise(function (resolve, reject) {
		// temp.track();

		temp.mkdir('lua-tessel', function(err, tmpDir) {
			if (err) reject(err);
			resolve(tmpDir);
		});
	});
}




Bundler._assembleBootstrap = function (dest, bootModule) {

	return new Promise(function (resolve, reject) {
		// Read template
		fs.readFile(__dirname + '/../template/_start.js', function (err, data) {
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




Bundler._assembleUserFiles = function (source, dest, filter) {
	// todo:
	// filter = filter || /\.(lua|txt|dat)$/;

	return new Promise(function (resolve, reject) {
		fs.copy(source, dest + '/app', function (err) {
			if (err) reject(err);
			resolve(dest);
		});
	});
}




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

		// pipe.pipe(fs.createWriteStream('/Users/paulcuth/Dropbox/tessel/lua-tessel/testout.tar'))
	});
}




module.exports = Bundler;