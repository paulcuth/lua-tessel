
-- Require object from sub directory
local logger = require 'logger.logger'

-- Require function from current path
local fibonacci = require 'fibonacci'

logger.log(fibonacci(5))
logger.log(fibonacci(25))