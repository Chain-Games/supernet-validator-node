# Use an official base image
# FROM ubuntu
FROM ubuntu:latest

WORKDIR /polygon-edge

RUN apt-get update && apt-get install -y jq

RUN apt-get update && apt-get install -y netcat-traditional

RUN apt-get install sudo -y

RUN apt-get update && apt-get install vim -y

RUN apt-get update && apt-get install fish -y

RUN apt-get install curl -y

RUN apt-get install screen -y

RUN apt-get install psmisc -y

COPY ./scripts/addValidator ./scripts/addValidator

COPY ./scripts/start ./scripts/start 

COPY ./scripts/setValidatorInfo.js ./scripts/setValidatorInfo.js

RUN  chmod +x ./scripts/start

COPY ./scripts/publicKey.js ./scripts/publicKey.js

COPY ./scripts/transferOwnerShip.js ./scripts/transferOwnerShip.js

COPY ./scripts/callTransferOwnership.js ./scripts/callTransferOwnership.js

COPY ./scripts/updateCommissionRate.js ./scripts/updateCommissionRate.js  

COPY ./scripts/abi ./scripts/abi

COPY ./polygon-edge .

COPY ./genesis.json .

COPY ./.env ./.env

COPY ./scripts/.env ./scripts/.env

COPY ./package.json .

COPY ./test-chain-5 ./test-chain-5

EXPOSE 10000 30301 10002

CMD ["tail", "-f", "/dev/null"]
