#!/bin/bash

#Run this file to install all Jupyterswap Frontend

echo "Install node modules"
echo "Rebuild contracts"
cd Jupyter-Swap/Contracts && npm install
truffle build

cp -r ./build/contracts/ ../Frontend/src/contracts/build

cd ../ && ENV=production node CONSTANTS.js


cd ../../Frontend && npm install && npm run build



