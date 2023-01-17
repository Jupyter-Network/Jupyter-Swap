#!/bin/bash

#Read flags
while getopts p,migration flag
do
    case "${flag}" in
        p) purge_db="true";;
    esac
done



echo "Starting JupyterSwap development"
#Blockchain
echo "Open Ganache"
gnome-terminal -- ganache -i 5777

sleep 5

echo "Contract migration"
(cd ./Contracts && truffle migrate --reset  --network local)

echo "Copy Constants"
node CONSTANTS.js

echo "Copy Contract JSON data"
cp -v ./Contracts/build/contracts/* ./Frontend/src/contracts/build

#Database
echo "Start Database"
sudo docker start timescaledb
if [[ $purge_db = "true" ]]
then
    echo "Purge and restart Database"
    ./Backend/Database/runDB.sh
fi


echo "Start Backend"
(cd ./Backend && gnome-terminal -- node index.js)

echo "Start Rest Server"
(cd ./Backend/Rest && gnome-terminal -- node index.js)

echo "Start Frontend"
(cd ./Frontend && gnome-terminal -- npm run start)

