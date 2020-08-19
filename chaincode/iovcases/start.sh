#!/bin/sh
CORE_CHAINCODE_ID_NAME=$1 CORE_PEER_TLS_ENABLED=false yarn start --peer.address peer:7052
