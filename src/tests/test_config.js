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

var config = require('../libs/config');

exports.tests = {
    updateSettings_withNewPortValue_hasChanged:function (test) {
        var oldValue = config.target.port;
        config.updateSettings({'upgradeReq':{'url':'/websockify/host/localhost/port/5905'}}, function() {});
        var newValue = config.target.port;
        test.notEqual(oldValue, newValue);
        test.done();
    },

    updateSettings_working_host_whitelist:function (test) {
        config.whitelist.settings.enableHost = true;
        var oldValue = config.target.host;
        config.updateSettings({'upgradeReq':{'url':'/host/perico/port/5905'},'close':function() {}}, function() {});
        var newValue = config.target.host;
        test.equal(oldValue, newValue);
        test.done();
    },

    updateSettings_working_host_ok_whitelist:function (test) {
        var expectedValue = 'perico';
        config.whitelist.settings.hosts.push(expectedValue);
        config.whitelist.settings.enableHost = true;
        config.updateSettings({'upgradeReq':{'url':'/host/' + expectedValue + '/port/5905'},'close':function() {}}, function() {});
        var newValue = config.target.host;
        test.equal(expectedValue, newValue);
        test.done();
    },

    updateSettings_working_subnet_whitelist:function (test) {
        config.whitelist.settings.enableMask = true;
        var oldValue = config.target.host;
        config.updateSettings({'upgradeReq':{'url':'/host/192.168.4.5/port/5905'},'close':function() {}}, function() {});
        var newValue = config.target.host;
        test.equal(oldValue, newValue);
        test.done();
    },

    updateSettings_working_subnet_ok_whitelist:function (test) {
        config.whitelist.settings.enableMask = true;
        var expectedValue = '192.168.3.5';
        config.updateSettings({'upgradeReq':{'url':'/host/' + expectedValue + '/port/5905'},'close':function() {}}, function() {});
        var newValue = config.target.host;
        test.equal(expectedValue, newValue);
        test.done();
    },

    updateSettings_working_port_whitelist:function (test) {
        var oldValue = config.target.port;
        config.updateSettings({'upgradeReq':{'url':'/host/localhost/port/65000'},'close':function() {}}, function() {});
        var newValue = config.target.port;
        test.equal(oldValue, newValue);
        test.done();
    },

	updateSettings_working_port_ok_whitelist:function (test) {
		var oldValue = config.target.port;
		config.updateSettings({'upgradeReq':{'url':'/host/localhost/port/6000'},'close':function() {}}, function() {});
		var newValue = config.target.port;
		test.notEqual(oldValue, newValue);
		test.done();
	},

    updateStats_withPlusValue_meansTwoValues:function (test) {
        var oldSummation = config.stats.allConn + config.stats.aliveConn;
        config.updateStats({'opr':'+'}, config);
        var newSummation = config.stats.allConn + config.stats.aliveConn;
        test.ok((newSummation - oldSummation) == 2);
        test.done();
    },

    updateStats_withSubValue_meansOneNegativeValue:function (test) {
        var oldSummation = config.stats.aliveConn;
        config.updateStats({'opr':'-'}, config);
        var newSummation = config.stats.aliveConn;
        test.ok((newSummation - oldSummation) == -1);
        test.done();
    },

    updateStats_withReqValue_meansOnePositiveValue:function (test) {
        var oldSummation = config.stats.reqs;
        config.updateStats({'opr':'r'}, config);
        var newSummation = config.stats.reqs;
        test.ok((newSummation - oldSummation) == 1);
        test.done();
    }
};
