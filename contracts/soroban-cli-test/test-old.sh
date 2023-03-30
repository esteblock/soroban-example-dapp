#!/bin/bash
set -e
NETWORK="$1"

CROWDFUND_WASM="target/wasm32-unknown-unknown/release/soroban_crowdfund_contract.wasm"
TOKEN_WASM="contracts/token/soroban_token_spec.wasm"

echo "Testing the Crowdfunding Contract using soroban-client"

echo "1. Miniting 100 units of EXT token to supporter account"
ARGS="--network $NETWORK --identity sender_user"

soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_crowdfund_contract.wasm \
  --id "$CROWD_ID" \
  --fn deposit -- \
  --user "$SENDER_PUBLIC" \
  --amount $TOTAL_AMOUNT 


echo "Configure the soroban client to the sender_user secret"
SENDER_SECRET="GBFSAUAGC4XB2ZI6B4N464MVFR5JWX3SZCSH43BXMR3N44MD2SFKF7L7"
mkdir -p ".soroban/identities"

echo "secret_key = \"$SENDER_SECRET\"" > .soroban/identities/sender_user.toml

ARGS="--network $NETWORK --identity sender_user"

echo Check sender_user total balance
SENDER_PUBLIC="GBFSAUAGC4XB2ZI6B4N464MVFR5JWX3SZCSH43BXMR3N44MD2SFKF7L7"
TOKEN_ID=$(cat .soroban/token_id)
echo "Token id: $TOKEN_ID"

TOTAL_AMOUNT=$(soroban contract invoke \
  $ARGS \
  --wasm contracts/token/soroban_token_spec.wasm \
  --id "$TOKEN_ID" \
  --fn balance -- \
  --id "$SENDER_PUBLIC" )
echo $TOTAL_AMOUNT
TOTAL_AMOUNT=$(echo $TOTAL_AMOUNT | tr -d \")

echo "Receiver Balance is: $TOTAL_AMOUNT"

echo "Now will DEPOSIT $THIRD_PARTY_PUBLIC"


echo Getting crowd id
CROWD_ID=$(cat .soroban/crowdfund_id)

soroban contract invoke \
  $ARGS \
  --wasm target/wasm32-unknown-unknown/release/soroban_crowdfund_contract.wasm \
  --id "$CROWD_ID" \
  --fn deposit -- \
  --user "$SENDER_PUBLIC" \
  --amount $TOTAL_AMOUNT 

