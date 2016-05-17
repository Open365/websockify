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


/**
 *  Websockify HTTPS/WSS
 */

var Notifier = require('eyeos-service-ready-notify');
var log2out = require('log2out');
var logger = log2out.getLogger('eyeos-websockify');
var Server = require('./libs/Server');

var globalConfig = require('./libs/config'),
	monitor = require('./libs/monitor'),
	server = globalConfig.protocol;

var pf = require('policyfile');
var cluster = require('cluster');
var https = require(server);

var httpsServer = server == 'https' ? https.createServer(globalConfig.ssl) : https.createServer();

process.on('uncaughtException', function(err) {
	logger.error('# [' + (new Date()).getTime() + '] UNCAUGHT EXCEPTION');
	logger.error(err.stack);
});

if (globalConfig.useWithoutCluster) {
	var websockifyServer = new Server(httpsServer, 0);
	websockifyServer.start(false);
} else {
    if (cluster.isMaster) {
        logger.info('# [' + (new Date()).getTime() + '] Starting Websockify service');
        logger.info('# Master 0 - pid: ' + process.pid);
        logger.info("=====================   CONFIGURATION    ========================");
        logger.info(globalConfig);
        logger.info("=================================================================");


        httpsServer.on('request', monitor.handleRequest);

        httpsServer.listen(globalConfig.source.port + 1);

        for (var i = 0; i < globalConfig.local.workers; i++) {
            var worker = cluster.fork();
            worker.on('message', function (data) {
                globalConfig.updateStats(data, globalConfig);
            });
            worker.on('exit', function(code, signal) {
                logger.error('# [' + (new Date()).getTime() + '] Worker ' + this.process.pid + ' died. Fork a new one.');
                logger.error({
                    'code' : code,
                    'signal' : signal
                });
                cluster.fork();
            });
        }
    } else if (cluster.isWorker) {
        logger.info('# Worker ' + cluster.worker.id + ' - pid: ' + cluster.worker.process.pid);

		httpsServer.listen(globalConfig.source.port);

		pf.createServer().listen(-1, httpsServer);

		var websockifyServer = new Server(httpsServer, cluster.worker.process.pid);
		websockifyServer.start(true);
    }
}

var notifier = new Notifier();
notifier.registerService();
