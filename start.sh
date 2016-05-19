#!/bin/bash
set -e
set -u

eyeos-run-server --serf "${InstallationDir}/netMeasurer/netMeasurer.js" "${InstallationDir}/src/eyeos-websockify.js"
