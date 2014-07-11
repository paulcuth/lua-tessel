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


	-- The value of the following variable is replaced by the CLI before
	-- the script is deployed to the device.
	local BOOT_MOD = '{{boot_mod}}'




	-- From http://lua-users.org/wiki/SplitJoin
	function split (str, sep)
		local sep, fields = sep or ":", {}
		local pattern = _G.string.format("([^%s]+)", sep)
		_G.string.gsub(str, pattern, function(c) fields[#fields+1] = c end)
		return fields
	end



	function ipairs (t)
		local mt = _G.getmetatable(t)

		if _G.type(mt.__ipairs) == 'function' then
			local iterator, t, index = mt.__ipairs(t)
			return iterator, t, index
		end

		return _G.ipairs(t)
	end



	function pairs (t)
		local mt = _G.getmetatable(t)

		if _G.type(mt.__pairs) == 'function' then
			local iterator, t, index = mt.__pairs(t)
			return iterator, t, index
		end

		return _G.pairs(t)
	end



	-- Reset global vars

	local lua_G = {
		
		assert = _G.assert,
		collectgarbage = _G.collectgarbage, 
		dofile = _G.dofile, 
		error = _G.error, 
		getfenv = _G.getfenv,
		getmetatable = _G.getmetatable, 
		ipairs = ipairs,
		load = _G.load,
		loadfile = _G.loadfile, 
		loadstring = _G.loadstring, 
		next = _G.next, 
		pairs = pairs, 
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
		coroutine = lua_G.coroutine
	}


	lua_G.package.preload = {

		bit32 = _G.package.preload.bit32,

		http = function () 
			return wrapColonyObject(require(_G.colony.global, 'http')) 
		end,

		json = function () 
			return wrapColonyObject(JSON) 
		end,

		tessel = function () 
			return wrapColonyObject(require(lua_G, 'tessel'))
		end,
		
		util = function () 
			return util 
		end
	}




	-- Repair native types

	-- function
	local mt = _G.getmetatable(function () end)
	mt.__tostring = nil

	-- nil
	mt = _G.getmetatable(nil)
	mt.__tostring = nil

	-- userdata
	_G.colony.obj_proto.toString = function () return 'userdata' end



	-- Remove the context parameter from Colony functions
	function wrapColonyFunction (f)
		return function (_, ...)

			-- Wrap any arguments that are passed
			local args = {...}

			for i, arg in _G.ipairs(args) do
				if _G.type(arg) == 'table' then 
					args[i] = wrapColonyObject(arg)
				end
			end

			return f(_G.unpack(args))
		end
	end



	-- Wrap Colony objects to remove context from all callbacks contained within
	function wrapColonyObject (obj) 
		local result = {}
		local mt = {}

		mt.__index = function (t, key) 

			-- Translate Lua numbering to JS.
			if _G.type(key) == 'number' then
				key = key - 1
			end

			local value = obj[key]
			local type = _G.type(value)

			if type == 'table' then
				-- Wrap nested objects/tables
				return wrapColonyObject(value)

			elseif type == 'function' then

				-- Wrap function values so that context params can be removed from callbacks
				return function (head, ...)

					-- If self is passed as first param, substitute in the orginal object
					if head == result then
						head = obj
					end

					-- Iterate over arguments, find callbacks, remove context param
					local args = {head, ...}

					for i, arg in _G.ipairs(args) do
						if _G.type(arg) == 'function' then 
							args[i] = wrapColonyFunction(arg)

						-- elseif _G.type(retval) == 'table' then 
						-- 	retvals[i] = wrapColonyObject(retval)
						end
					end

					-- Invoke function
					local retvals = { value(_G.unpack(args)) }

					-- Wrap return values
					for i, retval in _G.ipairs(retvals) do
						if _G.type(retval) == 'table' then 
							retvals[i] = wrapColonyObject(retval)
						end
					end

					return _G.unpack(retvals)
				end


			elseif key == 'fin' and not _G.rawget(t, key) and obj['end'] then
				-- If fin property requested, doesn't exist, but end() does, return that instead
				-- A slight hack to overcome tha fact the the oft used method in JS is reserved word in Lua
				return obj['end']

			else 
				-- Return original value
				return value
			end
		end


		-- Proxy assignments to original object
		mt.__newindex = function (t, key, value)

			-- Translate Lua numbering to JS.
			if _G.type(key) == 'number' then
				key = key - 1
			end

			obj[key] = value
		end


		mt.__ipairs = function (t) 
			return _G.ipairs(obj)
		end


		mt.__pairs = function (t) 
			return _G.pairs(obj)
		end


		_G.setmetatable(result, mt)
		return result
	end




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

	function util.setImmediate (func)
		return setImmediate(_G, func)
	end
	
	function util.setInterval (func, interval)
		return setInterval(_G, func, interval)
	end
	
	function util.setTimeout (func, timeout)
		return setTimeout(_G, func, timeout)
	end
	
	function util.clearImmediate (ref)
		return clearImmediate(_G, ref)
	end
	
	function util.clearInterval (ref)
		return clearInterval(_G, ref)
	end
	
	function util.clearTimeout (ref)
		return clearTimeout(_G, ref)
	end
	
	function util.getTimestamp ()
		return _G.colony.global.Date.now()
	end
	



	-- Load user script

	function boot () 
		-- Clear caches to ensure user script is loaded.
		package.loaded[BOOT_MOD] = nil
		package.preload[BOOT_MOD] = nil

		require(BOOT_MOD)
	end

	_G.setfenv(boot, lua_G)
	boot()


end 