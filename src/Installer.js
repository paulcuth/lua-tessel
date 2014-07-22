

var Promise = require('es6-promise').Promise,
	temp = require('temp'),
	tar = require('tar-fs'),
	fs = require('fs-extra'),
	colony = require('colony-compiler'),
	FileFinder = require("node-find-files"),
	npm = require('npm');





function Installer () {
}




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




Installer._createTempFolder = function () {

	return new Promise(function (resolve, reject) {
		temp.track();

		temp.mkdir('lua-tessel', function(err, tmpDir) {
			if (err) reject(err);
			resolve(tmpDir);
		});
	});
};




Installer._downloadPackage = function (name, dest) {

	return new Promise(function (resolve, reject) {
		
		npm.load({ loglevel: 'silent' }, function (err, npm) {
			if (err) reject(err);

			npm.prefix = dest;
			npm.commands.install([name], resolve.bind(void 0, dest));
		});
	});		
};




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




Installer._transcodeFile = function (path) {
	var source, result;

	source = fs.readFileSync(path, 'utf-8');
	result = colony.colonize(source);
	
	fs.writeFileSync(path, result.source);
};




Installer._buildTar = function (path, outputFilename) {
	return new Promise(function (resolve, reject) {
		var fileStream = fs.createWriteStream(outputFilename);
		tar.pack(path).pipe(fileStream);

		resolve();
	});
};




module.exports = Installer;