

local http = require 'http'
local tessel = require 'tessel'
local json = require 'json'


local URL = 'http://developer.yahooapis.com/TimeService/V1/getTime?appid=YahooDemo&output=json'




function getTime ()
	print 'Getting time from the Web...'

	local req = http:get(URL, function (res)
		local str = ''
		res:setEncoding 'utf8'

		res:on('data', function (chunk)
			str = str..chunk:toString()
		end)

		res:on('end', function ()
			local t = json:parse(str)
			local timestamp = tonumber(t.Result.Timestamp)
			print('The time is: '..os.date('%c', timestamp)..' UTC')
		end)

	end)

	req:on('error', function (e)
		print('Problem with request: '..e.message)
	end)
end




tessel.button:on('press', getTime)

print 'Press the button to request the current time...'
