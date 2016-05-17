FROM docker-registry.eyeosbcn.com/eyeos-fedora21-node-base
MAINTAINER eyeos

ENV InstallationDir /var/service/
ENV WHATAMI websockify

RUN yum install -y python-websockify openssl libstdc++-static && \
    yum clean all

WORKDIR ${InstallationDir}
COPY . ${InstallationDir}

RUN cd netMeasurer && npm install && npm cache clean && cd ..

WORKDIR src
RUN bash ${InstallationDir}/src/generate-keys.sh

RUN npm install --verbose && \
    npm cache clean

CMD ${InstallationDir}/start.sh
