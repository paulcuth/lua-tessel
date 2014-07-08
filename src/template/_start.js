---------------------------------------------------------------------------
--- Lua entry point and bootstrap.
--
-- This file has two purposes:
--   1. To restore the Lua environment to that which a Lua dev would expect.
--   2. Load the user sript.
--
-- Note: This script resets the enviroment back to a default Lua 5.1 environment. However,
-- it also adds two modules to package.preload so that they are available to be required
-- in the user script:
--   tessel - The Tessel hardware module
--   util - Utility functions that are too useful to discard.
--


return function (_ENV, _module)

	local tm = _G.require 'tm'
	local BOOT_MOD = '{{boot_mod}}'


	-- From http://lua-users.org/wiki/SplitJoin
	function split (str, sep)
		local sep, fields = sep or ":", {}
		local pattern = _G.string.format("([^%s]+)", sep)
		_G.string.gsub(str, pattern, function(c) fields[#fields+1] = c end)
		return fields
	end




	-- Reset global vars

	local lua_G = {
		
		assert = _G.assert,
		collectgarbage = _G.collectgarbage, 
		dofile = _G.dofile, 
		error = _G.error, 
		getfenv = _G.getfenv,
		getmetatable = _G.getmetatable, 
		ipairs = _G.ipairs, 
		load = _G.load,
		loadfile = _G.loadfile, 
		loadstring = _G.loadstring, 
		next = _G.next, 
		pairs = _G.pairs, 
		pcall = _G.pcall, 
		-- print = _G.print, 
		rawequal = _G.rawequal,
		rawget = _G.rawget, 
		rawset = _G.rawset, 
		select = _G.select, 
		setfenv = _G.setfenv, 
		setmetatable = _G.setmetatable, 
		tonumber = _G.tonumber,
		tostring = _G.tostring,
		type = _G.type, 
		unpack = _G.unpack,
		_VERSION = _G._VERSION,
		xpcall = _G.xpcall,

		module = _G.module, 
		require = _G.require, 
		-- package = _G.package, 

		coroutine = _G.coroutine, 
		string = _G.string, 
		table = _G.table, 
		math = _G.math, 
		io = _G.io,
		os = _G.os, 
		debug = _G.debug,

	}

	lua_G._G = lua_G

	lua_G.print = function (...)
		local args = {}

		for _, v in _G.ipairs({...}) do
			_G.table.insert(args, _G.tostring(v))
		end
		
		tm.log(10, _G.table.concat(args, '\t'))
	end


	-- Package lib

	lua_G.package = {
		cpath = _G.package.cpath,
		-- loaded = _G.package.loaded,
		loaders = _G.package.loaders,
		loadlib = _G.package.loadlib,
		path = './app/?.lua;'.._G.package.path,
		-- preload = _G.package.preload,
		seeall = _G.package.seeall,
	}

	lua_G.package.loaded = {
		string = lua_G.string,
		debug = lua_G.debug,
		package = lua_G.package,
		_G = lua_G,
		io = lua_G.io,
		os = lua_G.os,
		table = lua_G.table,
		math = lua_G.math,
		coroutine = lua_G.coroutine,

		tessel = require(lua_G, 'tessel'),
		util = util
	}

	lua_G.package.preload = {
		bit32 = _G.package.preload.bit32,
		hw = _G.package.preload.hw,
	}





	-- Repair native types

	-- function
	local mt = _G.getmetatable(function () end)
	mt.__tostring = nil

	-- nil
	mt = _G.getmetatable(nil)
	mt.__tostring = nil





	-- Emulate require()

	lua_G.require = function (modname, ...)

		-- Look in package.loaded
		local mod = lua_G.package.loaded[modname]
		if mod then return mod end

		-- Look in package.preload
		local preload = lua_G.package.preload[modname]
		if preload then return preload() end		


		-- Convert modname to path
		local modpath = _G.string.gsub(modname, '%.', '/')

		-- use package.path
		local paths = split(lua_G.package.path, ';')
		local searchPaths = {}

		for _, path in _G.ipairs(paths) do
			path = _G.string.gsub(path, '?', modpath)

			local success, code = _G.pcall(_G.colony._load, path)

			if success then
				local func, err = _G.loadstring(code, '@'..modname)

				if func == nil then 
					_G.error(err)
				end

				_G.setfenv(func, lua_G)

				-- Add to package.preload
				lua_G.package.preload[modname] = func
				
				local mod = func(...)
				lua_G.package.loaded[modname] = mod

				return mod
			end

			_G.table.insert(searchPaths, '	no file \''..path..'\'')
		end

		_G.error('module \''..modname..'\' not found:\n	no field package.preload[\''..modname..'\']\n'.._G.table.concat(searchPaths, '\n'))
	end




	-- Create util module to house useful non-Tessel non-Lua functions
	
	local util = {}

	lua_G.package.preload.util = function ()
		return util
	end

	function util.setInterval (func, interval)
		return setInterval(_G, func, interval)
	end
	
	function util.setTimeout (func, timeout)
		return setTimeout(_G, func, timeout)
	end
	
	function util.clearInterval (ref)
		return clearInterval(_G, ref)
	end
	
	function util.clearTimeout (ref)
		return clearTimeout(_G, ref)
	end
	



	-- Load user script

	function boot () 
		require(BOOT_MOD)
	end

	_G.setfenv(boot, lua_G)
	boot()


end 