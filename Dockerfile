FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI websockify

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD ${InstallationDir}/start.sh

COPY . ${InstallationDir}

RUN cd netMeasurer && npm install && npm cache clean && cd ..

RUN apk update && \
    /scripts-base/installExtraBuild.sh && \
    mkdir -p $HOME && \
    npm install -g istanbul && \
    npm install --verbose --production && \
    npm cache clean

WORKDIR src

RUN bash ${InstallationDir}/src/generate-keys.sh && \
    /scripts-base/deleteExtraBuild.sh && \
    rm -r /etc/ssl /var/cache/apk/* /tmp/*
