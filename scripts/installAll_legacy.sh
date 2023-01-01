#!/bin/bash

#Run this file to install all Jupyterswap components
sudo apt update

echo "Install node and global dependencies"
sudo apt install nginx
sudo apt install nodejs npm -y      
npm install pm2@latest -g
npm install truffle -g


echo "Install Docker"
sudo apt-get install \
    ca-certificates \
    curl \
    gnupg \
    lsb-release
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

 sudo apt-get update
 sudo apt-get install docker-ce docker-ce-cli containerd.io docker-compose-plugin


echo "Clone JupyterSwap Git"
git clone https://github.com/Jupyter-Network/Jupyter-Swap

echo "Install node modules"
cd Jupyter-Swap/Contracts && npm install
truffle build

cp -r ./build/contracts/ ../Frontend/src/contracts/build

cd ../ && ENV=production node CONSTANTS.js

cd ./Backend && npm install
cd ./Database && npm install

cd ../../Frontend && npm install



