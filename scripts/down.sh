
docker-compose -f ./../docker-compose-simple-3org.yaml down
docker network prune
rm -f ../channel-artifacts/myc.block
docker volume prune -f
