/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var log2out = require('log2out');

var globalConfig = require('./config');
var extend = require('extend');

var net = require('net');
var ws = require('ws').Server;

function Server(httpServer, pid) {
	this.logger = log2out.getLogger('Server');
	this.httpServer = httpServer;
	this.pid = pid;
}

Server.prototype.start = function (isInCluster) {

	var websocketServer = new ws({
		server : this.httpServer
	});

	websocketServer.on('headers', function(header) {
		header.push("Origin: *");
	});

	var self = this;
	websocketServer.on('connection', function(websocket) {
		websocket.pause();
		if (isInCluster) {
			process.send({ opr:'+' });
		}

		var config = {};
		extend(true, config, globalConfig);

		config.updateSettings(websocket, function(websocket, config) {
			self.onConnectionCallback(websocket, config);
		});
	});
};

Server.prototype.onConnectionCallback = function(websocket, config) {
	var self = this;
	var isInCluster = config.useCluster;
	if (isInCluster) {
		var strSocket = '[' + (new Date()).getTime() + '][' + this.pid + '][' + websocket.remoteAddress + ':' + websocket.remotePort + ':' + config.target.port + '] ';
	} else {
		var strSocket = '[' + (new Date()).getTime() + '][' + websocket.remoteAddress + ':' + websocket.remotePort + ':' + config.target.port + ']';
	}

	this.logger.info('Connection [socket] established, host:', config.target.host, ', port:', config.target.port, ', protocol:', config.source.protocol);

	var socket = new net.Socket();
	socket.connect(config.target.port, config.target.host);
	socket.pause();

	websocket.pingTimer = setInterval(function() {
		websocket.ping();
	}, 2000);

	websocket.on('error', function(err) {
		self.logger.error(strSocket, 'Error [socket]');
		self.logger.error(err.stack);
	});

	socket.on('error', function(err) {
		self.logger.error(strSocket, 'Error [server]');
		self.logger.error(err.stack);

		// This error code 4200 has been chosen since application specific error
		// code for websockets are in the range of 4000-4900. We have chosen 4200
		// for no specific reason
		self.socketError = new Error("Could not establish TCP connection to Server");
		self.socketError.code = 4200;
	});

	websocket.on('message', function(data) {
		//If websocket is base64 we must decode data to send to Spice
		if (config.source.protocol === 'base64') {
			data = new Buffer(data, 'base64');
		}
		//logger.trace('decoded message:', data);
		socket.write(data);
	});

	var send = function (data) {
		//logger.trace('message to browser:', data);
		//If websocket is base64 we must encode data to send to Browser
		if (config.source.protocol === 'base64') {
			websocket.send(data.toString('base64'), {
				binary : false
			});
		} else {
			websocket.send(data, {
				binary : true
			});
		}
	};

	socket.on('data', function (data) {
		send(data);
	});

	websocket.once('close', function() {
		clearInterval(websocket.pingTimer);
		self.logger.info(strSocket, 'Connection [socket] closed');
		if (self.isInCluster) {
			process.send({ opr:'-' });
		}
		socket.destroy();
	});

	socket.once('close', function() {
		self.logger.info(strSocket, 'Connection [server] closed');
		if (self.socketError) {
			websocket.close(self.socketError.code, self.socketError.message);
		} else {
			websocket.close();
		}
	});

	socket.once('connect', function() {
		self.logger.info(strSocket, 'Connection [server] established');
		socket.resume();
		websocket.resume();
	});
};

module.exports = Server;
