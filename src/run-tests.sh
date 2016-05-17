#!/usr/bin/env node
try {
    var reporter = require('nodeunit').reporters.default;
}
catch(e) {
    console.log("Cannot find nodeunit module.");
    console.log("Run: \n\t$ npm install nodeunit");
    console.log("");
    process.exit();
}

process.chdir(__dirname);
reporter.run(['tests/']);