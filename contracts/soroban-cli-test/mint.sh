#!/bin/bash
set -e


NETWORK="standalone"
ARGS="--network $NETWORK --identity token-admin"
ASSET_CODE=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.assetCode' )
SUPPORTER_ADDRESS=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.supporterPublic' )
TOKEN_ADMIN_ADDRESS=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.issuerPublic' )
TOTAL_AMOUNT="5"
TOKEN_ID=$(cat .soroban/token_id)

echo "Set the soroban identity as the token-admin"
soroban config identity address token-admin
echo "---"

echo "Mint $TOTAL_AMOUNT units of $ASSET_CODE"
echo "Minting to: $SUPPORTER_ADDRESS"

soroban contract invoke \
  $ARGS \
  --wasm contracts/token/soroban_token_spec.wasm \
  --id "$TOKEN_ID" \
  --fn xfer -- \
  --from "$TOKEN_ADMIN_ADDRESS" \
  --to "$SUPPORTER_ADDRESS" \
  --amount "50000000" 
