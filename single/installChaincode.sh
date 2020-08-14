#!/bin/bash
# Copyright Justin Chen All Rights Reserved.
#
# SPDX-License-Identifier: Apache-2.0
CHAINCODE_PACKAGE_NAME=$1
CHAINCODE_NAME=$2
SEQUENCE=$3
VERSION=$4



echo "========= Installing the newest chaincode ========="
echo "Chaincode name: $CHAINCODE_NAME"
peer lifecycle chaincode package "chaincode/$CHAINCODE_NAME/$CHAINCODE_PACKAGE_NAME" -p "chaincode/$CHAINCODE_NAME" -l node --label $CHAINCODE_NAME
peer lifecycle chaincode install "chaincode/$CHAINCODE_NAME/$CHAINCODE_PACKAGE_NAME"
CC_PACKAGE_ID=$(peer lifecycle chaincode queryinstalled | tail -n 1 |awk '{print $3}' | tr -d ",")

echo "========= Approving chaincode definition ======="
#collections config must be name as collections-config.json under chaincode directory
peer lifecycle chaincode approveformyorg -o orderer:7050 --channelID myc --name $CHAINCODE_NAME --version $VERSION --collections-config "chaincode/$CHAINCODE_NAME/collections_config.json" --package-id $CC_PACKAGE_ID --sequence $SEQUENCE
echo "========= Committing chaincode definition ========="
peer lifecycle chaincode commit -o orderer:7050 --channelID myc --name $CHAINCODE_NAME --version $VERSION --sequence $SEQUENCE --collections-config "chaincode/$CHAINCODE_NAME/collections_config.json"
echo "========= Finished Committing chaincode definition ======="
echo "use peer invoke to invoke transactions:"
echo "peer chaincode invoke -o orderer:7050 -C myc -n $CHAINCODE_NAME -c '{\"Args\":[\"init\"]}'"
echo "========= CHAINCODE ID ========="
echo $CC_PACKAGE_ID
echo "Use chaincode id to start chaincode container"


