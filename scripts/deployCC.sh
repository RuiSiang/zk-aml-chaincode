CHANNEL_NAME="myc"
CC_NAME="iovcases"
CC_SRC_PATH="../iovcases"
CC_VERSION=${1:-"0"}
CC_SEQUENCE=${2:-"1"}
CC_END_POLICY="OR('Org1MSP.member','Org2MSP.member','Org3MSP.member')"
CC_COLL_CONFIG="--collections-config $CC_SRC_PATH/collections_config.json"
CC_INIT_FCN=${3:-"NA"}
DELAY=${4:-"3"}
MAX_RETRY=${5:-"5"}
VERBOSE=${6:-"false"}

echo --- executing with the following
echo - CHANNEL_NAME:$'\e[0;32m'$CHANNEL_NAME$'\e[0m'
echo - CC_NAME:$'\e[0;32m'$CC_NAME$'\e[0m'
echo - CC_SRC_PATH:$'\e[0;32m'$CC_SRC_PATH$'\e[0m'
echo - CC_VERSION:$'\e[0;32m'$CC_VERSION$'\e[0m'
echo - CC_SEQUENCE:$'\e[0;32m'$CC_SEQUENCE$'\e[0m'
echo - CC_END_POLICY:$'\e[0;32m'$CC_END_POLICY$'\e[0m'
echo - CC_COLL_CONFIG:$'\e[0;32m'$CC_COLL_CONFIG$'\e[0m'
echo - CC_INIT_FCN:$'\e[0;32m'$CC_INIT_FCN$'\e[0m'
echo - DELAY:$'\e[0;32m'$DELAY$'\e[0m'
echo - MAX_RETRY:$'\e[0;32m'$MAX_RETRY$'\e[0m'
echo - VERBOSE:$'\e[0;32m'$VERBOSE$'\e[0m'



if [! -d "$CC_SRC_PATH" ]; then
	echo Path to chaincode does not exist. Please provide different path
	exit 1
else
	echo $'\e[0;32m'iovcases$'\e[0m' chaincode
fi


CC_END_POLICY="--signature-policy $CC_END_POLICY"



#if [ "$CC_INIT_FCN" = "NA" ]; then
#	INIT_REQUIRED=""
#fi

# import utils
. ./envVar.sh

packageChaincode() {
	ORG=$1
	setGlobals $ORG
	set -x
	peer lifecycle chaincode package ${CC_NAME}.tar.gz --path ${CC_SRC_PATH} --lang node --label ${CC_NAME}_${CC_VERSION} >&log.txt
	res=$?
	set +x
	cat log.txt
	verifyResult $res "Chaincode packaging on org${ORG} has failed"
	echo "===================== Chaincode is packaged on org${ORG} ===================== "
	echo
}

# installChaincode PEER ORG
installChaincode() {
	ORG=$1
	setGlobals $ORG
	set -x
	peer lifecycle chaincode install ${CC_NAME}.tar.gz >&log.txt
	res=$?
	set +x
	cat log.txt
	verifyResult $res "Chaincode installation on org${ORG} has failed"
	echo "===================== Chaincode is installed on org${ORG} ===================== "
	echo
}

# queryInstalled PEER ORG
queryInstalled() {
	ORG=$1
	setGlobals $ORG
	set -x
	peer lifecycle chaincode queryinstalled >&log.txt
	res=$?
	set +x
	cat log.txt
	PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
	verifyResult $res "Query installed on org${ORG} has failed"
	echo "===================== Query installed successful on org${ORG} on channel ===================== "
	echo
}

# approveForMyOrg VERSION PEER ORG
approveForMyOrg() {
	ORG=$1
	setGlobals $ORG
	set -x
	peer lifecycle chaincode approveformyorg -o orderer:7050 --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --package-id ${PACKAGE_ID} --sequence ${CC_SEQUENCE} ${CC_END_POLICY} ${CC_COLL_CONFIG} >&log.txt
	res=$?
	set +x
	cat log.txt
	verifyResult $res "Chaincode definition approved on org${ORG} on channel '$CHANNEL_NAME' failed"
	echo "===================== Chaincode definition approved on org${ORG} on channel '$CHANNEL_NAME' ===================== "
	echo
}

# checkCommitReadiness VERSION PEER ORG
checkCommitReadiness() {
	ORG=$1
	shift 1
	setGlobals $ORG
	echo "===================== Checking the commit readiness of the chaincode definition on org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local COUNTER=1
	# continue to poll
	# we either get a successful response, or reach MAX RETRY
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
		sleep $DELAY
		echo "Attempting to check the commit readiness of the chaincode definition on peer0.org${ORG}, Retry after $DELAY seconds."
		set -x
		peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} --sequence ${CC_SEQUENCE} ${CC_END_POLICY} ${CC_COLL_CONFIG} --output json >&log.txt
		res=$?
		set +x
		let rc=0
		for var in "$@"; do
			grep "$var" log.txt &>/dev/null || let rc=1
		done
		COUNTER=$(expr $COUNTER + 1)
	done
	cat log.txt
	if test $rc -eq 0; then
		echo "===================== Checking the commit readiness of the chaincode definition successful on org${ORG} on channel '$CHANNEL_NAME' ===================== "
	else
		echo
		echo $'\e[1;31m'"!!!!!!!!!!!!!!! After $MAX_RETRY attempts, Check commit readiness result on org${ORG} is INVALID !!!!!!!!!!!!!!!!"$'\e[0m'
		echo
		exit 1
	fi
}

# commitChaincodeDefinition VERSION PEER ORG (PEER ORG)...
commitChaincodeDefinition() {
	parsePeerConnectionParameters $@
	res=$?
	verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

	# while 'peer chaincode' command can get the orderer endpoint from the
	# peer (if join was successful), let's supply it directly as we know
	# it using the "-o" option
	set -x
	peer lifecycle chaincode commit -o orderer:7050 --channelID $CHANNEL_NAME --name ${CC_NAME} $PEER_CONN_PARMS --version ${CC_VERSION} --sequence ${CC_SEQUENCE} ${CC_END_POLICY} ${CC_COLL_CONFIG} >&log.txt
	res=$?
	set +x
	cat log.txt
	verifyResult $res "Chaincode definition commit failed on org${ORG} on channel '$CHANNEL_NAME' failed"
	echo "===================== Chaincode definition committed on channel '$CHANNEL_NAME' ===================== "
	echo
}

# queryCommitted ORG
queryCommitted() {
	ORG=$1
	setGlobals $ORG
	EXPECTED_RESULT="Version: ${CC_VERSION}, Sequence: ${CC_SEQUENCE}, Endorsement Plugin: escc, Validation Plugin: vscc"
	echo "===================== Querying chaincode definition on org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local COUNTER=1
	# continue to poll
	# we either get a successful response, or reach MAX RETRY
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
		sleep $DELAY
		echo "Attempting to Query committed status on org${ORG}, Retry after $DELAY seconds."
		set -x
		peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME} >&log.txt
		res=$?
		set +x
		test $res -eq 0 && VALUE=$(cat log.txt | grep -o '^Version: '$CC_VERSION', Sequence: [0-9]*, Endorsement Plugin: escc, Validation Plugin: vscc')
		test "$VALUE" = "$EXPECTED_RESULT" && let rc=0
		COUNTER=$(expr $COUNTER + 1)
	done
	echo
	cat log.txt
	if test $rc -eq 0; then
		echo "===================== Query chaincode definition successful on org${ORG} on channel '$CHANNEL_NAME' ===================== "
		echo
	else
		echo
		echo $'\e[1;31m'"!!!!!!!!!!!!!!! After $MAX_RETRY attempts, Query chaincode definition result on peer0.org${ORG} is INVALID !!!!!!!!!!!!!!!!"$'\e[0m'
		echo
		exit 1
	fi
}

chaincodeInvokeInit() {
	parsePeerConnectionParameters $@
	res=$?
	verifyResult $res "Invoke transaction failed on channel '$CHANNEL_NAME' due to uneven number of peer and org parameters "

	# while 'peer chaincode' command can get the orderer endpoint from the
	# peer (if join was successful), let's supply it directly as we know
	# it using the "-o" option
	set -x
	fcn_call='{"function":"'${CC_INIT_FCN}'","Args":[]}'
	echo invoke fcn call:${fcn_call}
	peer chaincode invoke -o orderer:7050 -C $CHANNEL_NAME -n ${CC_NAME} $PEER_CONN_PARMS -c ${fcn_call} >&log.txt
	res=$?
	set +x
	cat log.txt
	verifyResult $res "Invoke execution on $PEERS failed "
	echo "===================== Invoke transaction successful on $PEERS on channel '$CHANNEL_NAME' ===================== "
	echo
}

chaincodeQuery() {
	ORG=$1
	setGlobals $ORG
	echo "===================== Querying on org${ORG} on channel '$CHANNEL_NAME'... ===================== "
	local rc=1
	local COUNTER=1
	# continue to poll
	# we either get a successful response, or reach MAX RETRY
	while [ $rc -ne 0 -a $COUNTER -lt $MAX_RETRY ]; do
		sleep $DELAY
		echo "Attempting to Query org${ORG} and Org2 sharing private data, Retry after $DELAY seconds."
		set -x
		peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["getCases","Org2"]}' >&log.txt
		res=$?
		set +x
		let rc=$res
		COUNTER=$(expr $COUNTER + 1)
	done
	echo
	cat log.txt
	if test $rc -eq 0; then
		echo "===================== Query successful on org${ORG} on channel '$CHANNEL_NAME' ===================== "
		echo
	else
		echo
		echo $'\e[1;31m'"!!!!!!!!!!!!!!! After $MAX_RETRY attempts, Query result on org${ORG} is INVALID !!!!!!!!!!!!!!!!"$'\e[0m'
		echo
		exit 1
	fi
}

## package the chaincode
packageChaincode 1

## Install chaincode on peer0.org1 and peer0.org2
echo "Installing chaincode on org1..."
installChaincode 1
echo "Install chaincode on org2..."
installChaincode 2
echo "Install chaincode on org2..."
installChaincode 3

## query whether the chaincode is installed
queryInstalled 1

## approve the definition for org1
approveForMyOrg 1

## check whether the chaincode definition is ready to be committed
## expect org1 to have approved and org2,org3 not to
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": false" "\"Org3MSP\": false"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": false" "\"Org3MSP\": false"
checkCommitReadiness 3 "\"Org1MSP\": true" "\"Org2MSP\": false" "\"Org3MSP\": false"

## now approve also for org2
approveForMyOrg 2

## check whether the chaincode definition is ready to be committed
## expect org1,org2 to have approved and org3 not to
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": true" "\"Org3MSP\": false"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": true" "\"Org3MSP\": false"
checkCommitReadiness 3 "\"Org1MSP\": true" "\"Org2MSP\": true" "\"Org3MSP\": false"

## now approve also for org3
approveForMyOrg 3
checkCommitReadiness 1 "\"Org1MSP\": true" "\"Org2MSP\": true" "\"Org3MSP\": true"
checkCommitReadiness 2 "\"Org1MSP\": true" "\"Org2MSP\": true" "\"Org3MSP\": true"
checkCommitReadiness 3 "\"Org1MSP\": true" "\"Org2MSP\": true" "\"Org3MSP\": true"


## now that we know for sure both orgs have approved, commit the definition
commitChaincodeDefinition 1 2 3

## query on both orgs to see that the definition committed successfully
queryCommitted 1
queryCommitted 2
queryCommitted 3

## Invoke the chaincode - this does require that the chaincode have the 'initLedger'
## method defined
if [ "$CC_INIT_FCN" = "NA" ]; then
	echo "===================== Chaincode initialization is not required ===================== "
	echo
else
	chaincodeInvokeInit 1 2
fi

exit 0
