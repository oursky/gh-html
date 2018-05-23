#!/bin/sh
NAMESPACE=dochub

echo namespace: $NAMESPACE

kubectl -n "$NAMESPACE" apply -f all-in-one.yaml
