FROM docker-registry.eyeosbcn.com/alpine6-node-base

ENV WHATAMI websockify

ENV InstallationDir /var/service/

WORKDIR ${InstallationDir}

CMD ${InstallationDir}/start.sh

COPY . ${InstallationDir}

RUN cd netMeasurer && npm install && npm cache clean && cd ..

RUN /scripts-base/buildDependencies.sh --production --install && \
    mkdir -p $HOME && \
    npm install -g istanbul && \
    npm install --verbose --production && \
    npm cache clean

WORKDIR src

RUN bash ${InstallationDir}/src/generate-keys.sh && \
    /scripts-base/buildDependencies.sh --production --purgue && \
    rm -r /etc/ssl /var/cache/apk/* /tmp/*
