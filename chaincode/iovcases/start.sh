#!/bin/sh
CORE_CHAINCODE_ID_NAME=$2 CORE_PEER_TLS_ENABLED=false yarn start --peer.address org$1:7052
