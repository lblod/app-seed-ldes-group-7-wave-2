#!/bin/bash
clear

# retrieve data
DATA=./ldes-server/data
mkdir -m 0755 $DATA
git clone https://github.com/lblod/Semantics-YourFingertips-hackathon-wave-2-IPDC-LEDS-dumps $DATA
rm -rf ./ldes-server/data/.git

# rename files
for file in $DATA/* ; do renamed=$(echo "$file" | sed 's|instantiesnapshot?limit=25&||') ; mv $file $renamed ; done

# fix URLs in files
for file in $DATA/* ; do sed -i "s|https://ipdc.tni-vlaanderen.be/doc/instantiesnapshot?limit=25&|http://ldes-server:8080/|g" $file ; done

# start all systems
docker compose up -d --wait
