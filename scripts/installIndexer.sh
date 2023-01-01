#!/bin/bash

#Run this file to install all Jupyterswap blockchain indexer
echo "Install node modules"
cd ./Contracts
npm install
truffle build

cp -r ./build/contracts/ ../Frontend/src/contracts/build

cd ../ 
ENV=production node CONSTANTS.js


[ ! -d ./Backend/node_modules/ ] && cd ./Backend && npm install
[ ! -d ./Database/node_modules/ ] && cd ./Database && npm install


echo "Starting indexer"
pm2 start index.js --name indexer



