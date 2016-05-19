Websockify Server
=================

## Overview

Websockify is a proxy server that pipes Websocket => Socket

## How to use it

### Usage example and URL's

Websockify authorizes connections using a token (which is expected to be stored using eyeos-secret-sharer). Here
 you can see an example of a connection to websockify.

```javascript
ws = new WebSocket('ws://localhost:8008/websockify/destInfoToken/68025b6c-2db5-415b-bddc-659ea03eb9e9/type/raw');
```

### Development Mode

To be able to debug, set an environment variable, so that **Websockify** does not use node cluster:

```bash
export EYEOS_WEBSOCKIFY_USE_WITHOUT_CLUSTER=true
```

* Connect using an url in the client

```javascript
ws = new WebSocket('ws://localhost:8008/websockify/host/127.0.0.1/port/6000/type/raw');
```

### Some links:

 * http://nodejs.org/api/net.html#net_socket_pause
 * http://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js
 * https://github.com/caolan/nodeunit
 * https://github.com/nodejitsu/forever-monitor
 * http://howtonode.org/make-your-tests-deterministic
 * http://howtonode.org/why-use-closure
 * http://howtonode.org/prototypical-inheritance
 * https://github.com/dantebronto/picard/tree/master/lib/picard
 * http://visionmedia.github.com/masteringnode/book.html


## Quick help

* Install modules

```bash
	$ npm install
```

* Check tests

```bash
    $ cd src
    $ ./run_tests.sh
```

* Check `config.js` and execute the program

```bash
	$ node websockify.js
```

* Open SPICE client

```bash
	$ spicec -h 192.168.3.168 -p 5901
```
