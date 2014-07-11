

local tessel = require 'tessel'
local util = require 'util'

local led1 = tessel.led[1]:output(1)
local led2 = tessel.led[2]:output(0)


util.setInterval(function ()
	print "I'm blinking! (Press CTRL + C to stop)"
	led1:toggle()
	led2:toggle()
end, 100)
