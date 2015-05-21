#!/bin/bash -e

docker build -t registry.infra.cbd.int:5000/bch-cbd-int git@github.com:scbd/bch.cbd.int.git

docker push registry.infra.cbd.int:5000/bch-cbd-int
