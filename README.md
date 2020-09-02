# internet-of-vehicles-poc-chaincode

## Step 1 (Startup the network)
```shell
cd scripts
./start.sh
```

## Step 2 (Deploy chaincode in cli)

```shell
docker exec -ti cli bash
./deployCC
```


### Step 3 (invoke chaincode)

```shell
peer chaincode invoke -o orderer:7050 -C myc -n iovcases -c '{"Args":["init"]}'
```