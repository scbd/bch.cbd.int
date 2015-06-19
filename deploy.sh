#!/bin/bash -e

docker build -t localhost:5000/bch-cbd-int git@github.com:scbd/bch.cbd.int.git

docker push localhost:5000/bch-cbd-int
