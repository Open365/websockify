#!/bin/bash
set -e
set -u

eyeos-run-server --serf "${InstallationDir}/netMeasurer/netMeasurer.js" 'websockify 0.0.0.0:8102 rabbit.service.consul:5672' "${InstallationDir}/src/eyeos-websockify.js"
