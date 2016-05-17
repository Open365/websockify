#!/bin/sh -e
istanbul cover --report cobertura --dir build/reports/ /var/service/src/run-tests.sh
rm -fr /var/service/build
cp -r /var/service/src/build /var/service
