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

var monitor = require('../libs/monitor');

exports.tests = {
    handleRequest_stats_call_response_write:function (test) {
    	var called = false;
		var res = {'writeHead': function(){}, 'end': function() {}, 'write': function() {called=true;}};
    	var req = {'url':'/stats'};
    	monitor.handleRequest(req, res);
    	test.ok(called);
        test.done();
    },

    handleRequest_start:function (test) {
    	var called = false;
		var res = {'writeHead': function(){}, 'end': function() {}, 'write': function(data) {called=data;}};
    	var req = {'url':'/start'};
    	monitor.handleRequest(req, res);
    	test.equal(called, 'ok');
        test.done();
    }
};
