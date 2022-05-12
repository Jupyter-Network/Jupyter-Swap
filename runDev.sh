#!/bin/bash
echo "Starting JupyterSwap development"

echo "Open Ganache"
gnome-terminal -- ganache -i 5777 

echo "Contract migration"
(cd ./Contracts && truffle migrate --reset)

echo "Start Database"
(cd ./Backend/Database/ && ./runDB.sh)

echo "Start Backend"
(cd ./Backend && gnome-terminal -- node index.js)

echo "Start Rest Server"
(cd ./Backend/Rest && gnome-terminal -- node index.js)

echo "Start Frontend"
(cd ./Frontend && gnome-terminal -- npm run start)