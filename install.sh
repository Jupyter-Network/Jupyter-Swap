#!/bin/bash
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
RESET='\033[0;0m'
LIGHTBLUE='\033[0;94m'

echo -e "${YELLOW}Jupyter Swap Installation Script${RESET}"
echo -e "Select installation option: "
echo
exit 0

echo -e "1${BLUE} => ${RESET}Install frontend"
echo -e "2${LIGHTBLUE} => ${RESET}Install indexer"
echo -e "3${BLUE} => ${RESET}Install rest api"
echo -e "4${LIGHTBLUE} => ${RESET}Install database"
echo -e "9${BLUE} => ${RESET}exit"


read -N 1 ANSWER
echo 


case $ANSWER in 
    1)
        echo -e "${YELLOW}Installing frontend${RESET}"
        ./scripts/installDependencies.sh
        ./scripts/installFrontend.sh
    ;;
    2)
        echo -e "${YELLOW}Installing indexer${RESET}"
        ./scripts/installDependencies.sh
        ./scripts/installIndexer.sh

    ;;    
    3)
        echo -e "${YELLOW}Installing rest api${RESET}"
        ./scripts/installDependencies.sh
        ./scripts/installRest.sh
    ;;
    4)
        echo -e "${YELLOW}Installing database${RESET}"
        ./scripts/installDatabase.sh
        ./Backend/Database/runDB.sh
    ;;
    esac

