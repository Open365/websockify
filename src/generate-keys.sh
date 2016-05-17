#!/bin/sh
set -e
set -u

WEBSOCKIFYDIR="$(dirname "$(readlink -f "$0")")"
SSLDIR="$WEBSOCKIFYDIR/ssl"

[ -d "$SSLDIR" ] || mkdir -p "$SSLDIR"

if [ -e "$SSLDIR"/certificate.pem ]
then
	cat >&2 <<MSG
It seems you have your certificate generated. If you really want to generate
a new one, remove the following files:

	$SSLDIR/certificate.pem
	$SSLDIR/key.pem

and then execute this script again
MSG
else

echo "GENERATING PRIVATE KEY"
openssl genrsa -out "$SSLDIR"/key.pem 1024

echo "GENERATING CERTIFICATE REQUEST"
openssl req -new -key "$SSLDIR"/key.pem -out "$SSLDIR"/certrequest.csr \
	-subj '/CN=localhost/O=MyCompany/C=ES'

echo "SELF-SIGNING CERTIFICATE REQUEST TO GENERATE A NEW CERTIFICATE"
openssl x509 -req \
	-in "$SSLDIR"/certrequest.csr \
	-signkey "$SSLDIR"/key.pem \
	-days 3650 \
	-out "$SSLDIR"/certificate.pem

# removing certificate request as we don't need it.
rm "$SSLDIR"/certrequest.csr

cat <<MSG
FINISHED
You may start eyeos-websockify now by executing

    systemctl start eyeos-websockify.service

and before going to the VDI web client, you'll have to accept the certificate
in your browser by going to https://localhost:8000/

Examine /tmp/WEBSOCKIFY.log if it does not seem to work
MSG
fi

