FROM node:22.8

RUN npm install -g npm@10.5.0

WORKDIR /app

RUN npm install -g @othentic/othentic-cli

ENTRYPOINT [ "othentic-cli" ]
