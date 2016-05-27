FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI websockify

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD ${InstallationDir}/start.sh

COPY . ${InstallationDir}

RUN cd netMeasurer && npm install && npm cache clean && cd ..

RUN apk update && apk add --no-cache curl make gcc g++ git python dnsmasq bash && \
    mkdir -p $HOME && \
    npm install -g istanbul && \
    npm install --verbose --production && \
    npm cache clean

WORKDIR src

RUN bash ${InstallationDir}/src/generate-keys.sh && \
    apk del openssl ca-certificates libssh2 curl binutils-libs binutils gmp isl \
    libgomp libatomic pkgconf pkgconfig mpfr3 mpc1 gcc musl-dev libc-dev g++ expat \
    pcre git make libbz2 libffi gdbm ncurses-terminfo-base ncurses-terminfo ncurses-libs readline sqlite-libs && \
    rm -r /etc/ssl /var/cache/apk/* /tmp/*
