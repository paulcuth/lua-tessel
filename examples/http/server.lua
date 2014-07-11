

local http = require 'http'
local tessel = require 'tessel'

local PORT = 3000

local led = tessel.led[2]:output(0)
local on = false


local server = http:createServer(function (req, res)
	led:toggle()
	on = not on

	res:writeHead(200, { ['Content-Type'] = 'text/plain' })

	-- Note .end() is an invalid syntax in Lua, use alias .fin() instead 
	res:fin('Hello World,\nLED is '..(on and 'on' or 'off')..'.\n')
end)

server:listen(3000, '127.0.0.1')
print('Server running on port '..PORT..'...')
