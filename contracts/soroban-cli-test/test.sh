echo "1. Trust the asset by the supporter"
node ./contracts/soroban-cli-test/friendbot.js
node ./contracts/soroban-cli-test/trustAsset.js
echo "--"
echo "--"
echo "--"

echo "2. Mint 5 units of EXT token to supporter"
./contracts/soroban-cli-test/mint.sh

echo "3. Deposit 5 units from supporter to crowdfunding contract"
./contracts/soroban-cli-test/deposit.sh