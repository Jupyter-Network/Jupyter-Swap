#!/bin/bash

#Run this file to install all Jupyterswap Frontend

echo "Install node modules"
echo "Rebuild contracts"
cd ./Contracts
[ ! -d ./node_modules/ ] && npm install
truffle build

cp -r ./build/contracts/. ../Frontend/src/contracts/build

cd ../ 
ENV=production node CONSTANTS.js


cd ./Frontend
[ ! -d ./node_modules/ ] && npm install
npm run build
pm2 serve ./build/ 3000 --spa
sudo cp ./nginx/jupyterswap /etc/nginx/sites-enabled/
sudo systemctl reload nginx

