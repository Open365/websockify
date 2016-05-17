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

/**
 *  Websockify HTTPS/WSS
 */

var fs = require('fs');
var os = require('os');
var UrlParser = require('./urlparser.js');
var WhiteList = require('../whitelist/whitelist.js');

var whitelistSettings = {
	enableHost: false,
	hosts: ['localhost'],
	enableMask: false,
	subnets: ['192.168.3.0/24'],
	minPort:5900,
	maxPort:61614
};

var config = {

	// == Settings

	protocol: process.env.EYEOS_WEBSOCKIFY_PROTOCOL || 'https',
	useWithoutCluster: process.env.EYEOS_WEBSOCKIFY_USE_WITHOUT_CLUSTER === "true" || false,

	secretSharer: {
		host: process.env.EYEOS_WEBSOCKIFY_REDIS_HOST || 'redis.service.consul',
		port: process.env.EYEOS_WEBSOCKIFY_REDIS_PORT || 6379,
		options: {
			no_ready_check: process.env.EYEOS_WEBSOCKIFY_REDIS_NO_READY_CHECK === 'true' || false,
			max_attempts: process.env.EYEOS_WEBSOCKIFY_REDIS_MAX_ATTEMPTS || 10
		}
	},

	source:{
		protocol: process.env.EYEOS_WEBSOCKIFY_WEBSOCKET_PROTOCOL || 'binary',
		port: process.env.EYEOS_WEBSOCKIFY_WEBSOCKET_PORT || 8100
	},

	target:{
		host:'127.0.0.1',
		port:5900,
		allowHalfOpen:false,
		type: 'raw'
	},

	local:{
		workers:((os.cpus().length) / 2),
		filter:false,
		verbose: false,
		error:true
	},

	ssl:{
		key:fs.readFileSync(process.env.EYEOS_WEBSOCKIFY_SSL_KEY || 'ssl/key.pem'),
		cert:fs.readFileSync(process.env.EYEOS_WEBSOCKIFY_SSL_CERT || 'ssl/certificate.pem'),
		requestCert:false
	},

	stats:{
		start:(new Date()).getTime(),
		allConn:0,
		aliveConn:0,
		reqs:0
	},

	whitelist: new WhiteList(whitelistSettings),

	// == Methods

	updateStats:function (data, self) {
		switch (data.opr) {
			case '+' :
				self.stats.allConn++;
				self.stats.aliveConn++;
				break;
			case '-' :
				self.stats.aliveConn--;
				break;
			case 'r':
				self.stats.reqs++;
				break;
		}
	},

	updateSettings:function (websocket, onConnectionCallback) {
		var urlParser = new UrlParser();
		var obj = urlParser.getConfigFromPath(websocket.upgradeReq.url);
		this.configSet(websocket, obj, onConnectionCallback);
	},

	configSet: function(websocket, obj, callback) {
		var target = this.target;
		var port = obj.port ? (+obj.port) : 5900;
		target.type = obj.type ? obj.type : 'spice';

		if (websocket.protocol == undefined) { // This is to run integration test (websocket java client doesn't support protocol on handshake)
			this.source.protocol = obj.protocol;
		} else {
			this.source.protocol = websocket.protocol;
		}

		var validHost = this.whitelist.isValidHost(obj.host);
		target.host = validHost ? obj.host : target.host;

		var validPort = this.whitelist.isValidPort(port);
		target.port = validPort ? port : target.port;

		var accessGranted = validHost && validPort;

		if (!accessGranted) {
			this.whitelist.closeForWhitelist(websocket, "You are trying to connect a forbidden target.\n");
		}
		callback(websocket, this);
	}
};

module.exports = config;
