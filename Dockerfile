FROM node:6
MAINTAINER Matthieu Larcher <mlarcher@ringabell.org>

RUN mkdir -p /api
WORKDIR /api

EXPOSE 3000
ENV NO_DOCKER 1

COPY package.json /api/
RUN npm install

COPY . /api

CMD ["/bin/bash", "-c", "node scripts/wait-mysql-up.js && make db-migrate && node service.js"]
