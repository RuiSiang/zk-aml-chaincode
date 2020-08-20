
docker-compose -f ./../docker-compose-simple-3org.yaml down
rm -f ../channel-artifacts/myc.block
docker volume prune -f
