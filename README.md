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



## Issues
Currently there are many missing features and those features that do exist do have known issues. Please report any new issues you find in the [Issue tracker](https://github.com/paulcuth/lua-tessel/issues).

If you find a blocking issue, please consider fixing it and submitting a pull request.



## Acknowledgements
While this is a rewrite rather than a fork of the [official Tessel CLI](https://github.com/tessel/cli), there are several chucks of code taken from that project.


## License

MIT
