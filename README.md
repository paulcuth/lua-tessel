# lua-tessel
A CLI for scripting a [Tessel](https://tessel.io/) device in Lua.

---


## Please note
This is work in progress and it's not quite where I want it to be yet. There are issues yet to resolve and the API is liable to change.

I've shared this project now because the main route to executing Lua scripts on the Tessel is working and that feature may be of help to others.



## Getting started
```shell
git clone git@github.com:paulcuth/lua-tessel.git
cd lua-tessel
npm install -g
lua-tessel run examples/blink/blink.lua
```


## Features
You can currently `run` scripts on, `push` to and `erase` a USB-connected Tessel device. For everything else you will need to use the [official Tessel CLI](https://github.com/tessel/cli). There are currently no plans to replicate any other functionality of the Tessel CLI.



## Built-in modules
`lua-tessel` restores the developement environment on the Tessel back to a default Lua 5.1 environment. However, the following modules have also been added to package.preload and are available to require().

Some things to note when using these modules:
- Always use colon syntax when calling methods on JS modules from Lua.
- Numerical table keys are shifted to 1-based. Therefore, the LEDs at referenced by `tessel.led[1]` and `tessel.led[2]` and same for ports, pins, etc.
- `.end()` is used in some of the JS modules, but `t:end()` is invalid syntax in Lua. `t['end']()` can be used, but a `t:fin()` alias method is added for convenience.

### bit32
Bitwise operations as described in the [Lua docs](http://www.lua.org/manual/5.2/manual.html#6.7).

### http
HTTP functions as described in the [Node docs](http://nodejs.org/api/http.html).

### json
JSON functions as described on [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON#Methods).

### tessel
Allows access to features on the board. The API is described in the [Tessel docs](https://tessel.io/docs/hardwareAPI).

### util
Provides some useful functionality that is available in the Tessel runtime. Currently, the following methods are available:
- `util.clearImmediate(ref)` - Prevents an immediate callback from executing.
- `util.clearInterval(ref)` - Stops an interval.
- `util.clearTimeout(ref)` - Prevents a timeout from executing.
- `ref = util.setImmediate(func)` - Execute a callback on the next tick.
- `ref = util.setInterval(func, delay)` - Execute a callback repeatedly with a specified delay (in ms).
- `ref = util.setTimeout(func, delay)` - Execute a callback once after a specified delay (in ms).

If you know of any other functionality in the Tessel runtime and you'd like to see it here, please create an issue or send a pull request.


## Issues
Please report any new issues you find in the [issue tracker](https://github.com/paulcuth/lua-tessel/issues).

If you find a blocking issue, please consider fixing it and submitting a pull request.



## Acknowledgements
While this is a rewrite rather than a fork of the [official Tessel CLI](https://github.com/tessel/cli), there are several chucks of code taken from that project.


## License

MIT
