#!/bin/bash

#Run this file to install all Jupyterswap rest api


echo "Install node modules"
cd Jupyter-Swap/Contracts && npm install
truffle build

cp -r ./build/contracts/ ../Frontend/src/contracts/build

cd ../ && ENV=production node CONSTANTS.js


[ ! -d ./Backend/node_modules/ ] && cd ./Backend && npm install
[ ! -d ./Database/node_modules/ ] && cd ./Database && npm install

echo "Starting rest api"
cd ../Rest && pm2 start index.js --name rest