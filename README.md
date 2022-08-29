# zk-aml-chaincode

## Step 0 (nodejs compile and build)
```shell
cd aml
npm install
npm run build
```

## Step 1 (Startup the network)
```shell
cd scripts
./start.sh
```

## Step 2 (Deploy chaincode in cli)

```shell
docker exec -ti cli bash
cd scripts
./deployCC
```


### Step 3 (invoke chaincode)

```shell
peer chaincode invoke -o orderer:7050 -C myc -n aml -c '{"Args":["init"]}'
```
