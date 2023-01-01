#!/bin/bash

#Run this file to install all Jupyterswap dependencies
sudo apt update

echo "Install node and global dependencies"
sudo apt install nginx
sudo apt install nodejs npm -y      
[ -x "$(pm2 -v)" ] && npm install pm2@latest -g
[ -x "$(truffle -v)" ] && npm install truffle -g





