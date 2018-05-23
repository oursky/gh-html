#!/bin/sh
NAMESPACE=dochub

echo namespace: $NAMESPACE

kubectl -n "$NAMESPACE" delete secret app-secret
kubectl -n "$NAMESPACE" create secret generic app-secret --from-env-file=secret
kubectl -n "$NAMESPACE" get secret app-secret -o yaml
