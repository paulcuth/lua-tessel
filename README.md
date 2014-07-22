# lua-tessel
A CLI for scripting a [Tessel](https://tessel.io/) device in Lua.

---


## Getting started
```shell
git clone git@github.com:paulcuth/lua-tessel.git
cd lua-tessel
npm install -g
lua-tessel run examples/blink/blink.lua
```


## Features
You can currently `run` scripts on, `push` to and `erase` a USB-connected Tessel device. For everything else you will need to use the [official Tessel CLI](https://github.com/tessel/cli). There are currently no plans to replicate any other functionality of the Tessel CLI.


## Interacting with NPM packages
You can use NPM packages in your Lua code (packages for Tessel modules, for example) by `require()`ing them much like you would Lua modules. To do this, use the `install` command:

```shell
lua-tessel install ambient-attx4
```

This will download the package from the NPM registy and create `ambient-attx4.lua.tar` in the current working directory. You can then move this `.tar` file around in your project and `require()` it like you would a Lua module. See `/examples/ambient/ambient.lua` for example code.

Make sure you've also read the [Things to note when using JavaScript modules from Lua](#things-to-note-when-using-javascript-modules-from-lua).


## Built-in modules
`lua-tessel` restores the developement environment on the Tessel back to a default Lua 5.1 environment. However, the following modules have also been added to package.preload and are available to require().

You should also be aware of the [Things to note when using JavaScript modules from Lua](#things-to-note-when-using-javascript-modules-from-lua).

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
- `timestamp = getTimestamp()` - Returns the unix tmiestamp for the current time.
- `ref = util.setImmediate(func)` - Execute a callback on the next tick.
- `ref = util.setInterval(func, delay)` - Execute a callback repeatedly with a specified delay (in ms).
- `ref = util.setTimeout(func, delay)` - Execute a callback once after a specified delay (in ms).

If you know of any other functionality in the Tessel runtime and you'd like to see it here, please create an issue or send a pull request.


## Things to note when using JavaScript modules from Lua
- Always use colon syntax when calling methods on JS modules from Lua.
- Numerical table keys are shifted to 1-based. Therefore, the LEDs at referenced by `tessel.led[1]` and `tessel.led[2]` and same for pins, GPIO, etc.
- `.end()` is used in some of the JS modules, but `t:end()` is invalid syntax in Lua. `t['end']()` can be used, but a `t:fin()` alias method is added for convenience.



## Issues
Please report any new issues you find in the [issue tracker](https://github.com/paulcuth/lua-tessel/issues).

If you find a blocking issue, please consider fixing it and submitting a pull request.


## Acknowledgements
While this is a rewrite rather than a fork of the [official Tessel CLI](https://github.com/tessel/cli), there are several chucks of code taken from that project.


## License

MIT
