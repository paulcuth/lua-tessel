local tessel = require 'tessel'
local ambientlib = require 'ambient-attx4'
local util = require 'util'

local port = tessel.ports['A']
local ambient = ambientlib:use(port)


ambient:on('ready', function ()
	-- Get points of light and sound data.
	util.setInterval(function ()
		ambient:getLightLevel(function (err, ldata)
			ambient:getSoundLevel(function (err, sdata)
				print('Light level:', ldata, 'Sound Level:', sdata)
			end)
		end)
	end, 250)


	ambient:setLightTrigger(.5)

	-- Set a light level trigger
	-- The trigger is a float between 0 and 1
	ambient:on('light-trigger', function (data)
		print('Our light trigger was hit:', data)

		-- Clear the trigger so it stops firing
		ambient:clearLightTrigger()
		-- After 1.5 seconds reset light trigger
		util.setTimeout(function ()
			ambient:setLightTrigger(.5)
		end, 1500)
	end)


	-- Set a sound level trigger
	-- The trigger is a float between 0 and 1
	ambient:setSoundTrigger(.1)

	ambient:on('sound-trigger', function (data)
		print('Something happened with sound:', data)

		-- Clear it
		ambient:clearSoundTrigger()

		-- After 1.5 seconds reset sound trigger
		util.setTimeout(function ()
			ambient:setSoundTrigger(.1)
		end, 1500)
	end)

end)



ambient:on('error', function (err)
	print('ERROR:', err.message)
end)
