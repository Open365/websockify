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

var cluster = require('cluster'),
    util = require('util'),
    config = require('./config'),
    logger = require('log2out').getLogger('Monitor');

var monitor = {

    // == Methods

    handleRequest:function (req, res) {
        logger.info('# [' + cluster.isMaster + '] Request HTTPS page: ' + req.url);

        res.writeHead(200, {'Content-Type':'text/plain'});

        if (cluster.isMaster) {
            switch (req.url) {
                case '/stats' :
                    res.write(util.inspect(
                        [   (new Date()).getTime(),
                            config.local,
                            config.source,
                            config.target,
                            config.stats
                        ], true, 1));
                    break;
                case '/die' :
                    res.end('byebye');
                    process.exit(0);
                    break;
                case '/start' :
                    res.write('ok');
                    break;
            }
        }
        res.end();
    }
};

module.exports = monitor;
