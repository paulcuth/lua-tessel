# lua-tessel
A CLI that enables the scripting of a [Tessel](https://tessel.io/) device in Lua.

---


## Please note
This is work in progress and it's still very early days. There are many issues yet to resolve and the API is very likely to change. Please be patient.

I've shared this project now because the main route to execute Lua scripts on the Tessel is working and this feature may be of help to others.



## Getting started
```shell
git clone git@github.com:paulcuth/lua-tessel.git
cd lua-tessel
npm install -g
lua-tessel run examples/blink.lua
```


## Features
You can currently run and flash Lua scripts to a USB-connected Tessel device. For everything else, including erasing a flashed Lua script, you will need to use the [official Tessel CLI](https://github.com/tessel/cli).



## Built-in modules
lua-tessel restores the developement environment on the Tessel back to a default Lua 5.1 environment. However there are also two modules that are available in package.preload: `tessel` and `util`.

### tessel
Allows access to features on the board. The API is described in the [Tessel docs](https://tessel.io/docs/hardwareAPI), but remember to use colon syntax when calling any of the methods.

### util
Provides some useful functionality that is available in the Tessel runtime. Currently, the following methods are available:
- `util.clearInterval(ref)` - Stops an interval.
- `util.clearTimeout(ref)` - Prevents a callback from executing.
- `ref = util.setInterval(func, delay)` - Execute a callback repeatedly with a specified delay (in ms).
- `ref = util.setTimeout(func, delay)` - Execute a callback once after a specified delay (in ms).

If you know of any other functionality in the Tessel runtime that you'd like to see here, please create an issue or send a pull request.


## Issues
Currently there are many missing features and those features that do exist do have known issues. Please report any new issues you find in the [Issue tracker](https://github.com/paulcuth/lua-tessel/issues).

If you find a blocking issue, please consider fixing it and submitting a pull request.



## Acknowledgements
While this is a rewrite rather than a fork of the [official Tessel CLI](https://github.com/tessel/cli), there are several chucks of code taken from that project.


## License

MIT
