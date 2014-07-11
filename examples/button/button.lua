
local tessel = require 'tessel'
local led = tessel.led[2]:output(0)


tessel.button:on('press', function (...)
	print('The button was pressed!', ...);
	led:toggle()
end)

