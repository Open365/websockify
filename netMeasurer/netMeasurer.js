#!/usr/bin/env node
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


var ws = require("nodejs-websocket");
var Notifier = require('eyeos-service-ready-notify');
var uuid = require('uuid');
var settings = require("./settings");

console.log("Creating websocket pong server at port ", settings.port);

var server = ws.createServer(function (conn) {
	conn.on("text", function (str) {
		conn.sendText("pong");
	});
});

server.listen(settings.port, function() {
    var notifier = new Notifier();
    notifier.registerService(uuid.v4().split('-')[4], 'netMesurer', null, settings.port);
});
