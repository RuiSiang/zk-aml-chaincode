#!/bin/bash

docker swarm init
docker network create -d overlay --attachable aml-ingress
docker-compose -f ../docker-compose-simple-3org.yaml up -d

