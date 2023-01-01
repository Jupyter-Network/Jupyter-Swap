echo "Remove old Database"
sudo docker stop timescaledb
sudo docker rm timescaledb

echo "Starting new Database"
sudo docker run -d --name timescaledb -p 5432:5432 -e POSTGRES_PASSWORD=password timescale/timescaledb:latest-pg14
sleep 3

echo "Creating Tables"
node ./Backend/Database/index.js

