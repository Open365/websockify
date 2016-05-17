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

var log2out = require("log2out");
var WhiteList = function(settings) {
    this.settings = settings;
    this.masks = [];
    this._generateMasks(settings.subnets);
    this.logger = log2out.getLogger("Whitelist");
};

WhiteList.prototype = {
    subnetRegex: /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/g,

    _generateMasks: function(subnets) {
        var arr, rShift, mask;
        for (var i = 0, len = subnets.length;i < len;i++) {
            arr = subnets[i].split('/');
            rShift = 32 - arr[1];
            mask = {
                ip: this._getIP(arr[0]) >>> rShift,
                rShift: rShift
            };
            this.masks.push(mask);
        }
    },

    _getIP: function(ipString) {
        var ipArray = ipString.split('.');
        return (+ipArray[0]) * 0x01000000 + (+ipArray[1]) * 0x00010000 + (+ipArray[2]) * 0x00000100 + (+ipArray[3]);
    },

    closeForWhitelist: function(websocket, message) {
        websocket.close(1008, message);//RFC 6455 status code 1008:'Policy Violation'
    },

    isValidHost: function(host) {
        var accessGranted = false;
        var whitelist = this.settings;
        if (whitelist.enableMask && !!host && !!host.match(this.subnetRegex)) {
            var masks = this.masks;
            try {
                var mask;
                for (var i = 0, len = masks.length;i < len;i++) {
                    mask = masks[i];
                    if (mask.ip === this._getIP(host) >>> mask.rShift) {
                        accessGranted = true;
                        break;
                    }
                }
            } catch (e) {
                this.logger.debug("Wrong IP provided: ", e);
            }

        } else if (whitelist.enableHost && !!host && whitelist.hosts.indexOf(host) != -1) {
            accessGranted = true;
        } else if (!whitelist.enableMask && !whitelist.enableHost && !!host) {
            accessGranted = true;
        } else {
            accessGranted = false;
        }

        return accessGranted;
    },

    isValidPort: function(port) {
        var whitelist = this.settings;

        return port && port >= whitelist.minPort && port < whitelist.maxPort;
    }
};

module.exports = WhiteList;