#!/bin/bash
set -e

NETWORK="standalone"

ASSET_CODE=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.assetCode' )
SUPPORTER_ADDRESS=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.supporterPublic' )
SUPPORTER_SECRET=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.supporterSecret' )
TOKEN_ADMIN_ADDRESS=$(cat ./contracts/soroban-cli-test/settings.json | jq  -r '.issuerPublic' )
CROWD_ID=$(cat .soroban/crowdfund_id)

TOTAL_AMOUNT="5"
TOKEN_ID=$(cat .soroban/token_id)


echo "Configure the soroban client to the supporter_user secret"

mkdir -p ".soroban/identities"
echo "secret_key = \"$SUPPORTER_SECRET\"" > .soroban/identities/supporter_user.toml
ARGS="--network $NETWORK --identity supporter_user"

echo "Will deposit now"
soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_crowdfund_contract.wasm \
  --id "$CROWD_ID" \
  --fn deposit -- \
  --user "$SUPPORTER_ADDRESS" \
  --amount $TOTAL_AMOUNT 


