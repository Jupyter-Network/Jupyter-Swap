#!/bin/bash

#Run this file to install all Jupyterswap blockchain indexer
echo "Install node modules"
cd ./Contracts
[! -d ./node_modules/ ] && npm install
 truffle build

cp -r ./build/contracts/. ../Frontend/src/contracts/build

cd ../ 
ENV=production node CONSTANTS.js

cd ./Backend
[ ! -d ./node_modules/ ] && npm install
cd ./Database
[ ! -d ./node_modules/ ] && npm install


echo "Starting indexer"
pm2 start index.js --name indexer



