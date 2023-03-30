import StellarSdk from "stellar-sdk";
import settings from "./settings.json"  assert { type: "json" };

const asset_code = settings.assetCode;
console.log("Using asset_code: ", asset_code)

var server = new StellarSdk.Server(settings.horizonUrl, {allowHttp: true});

var networkPassphrase = settings.networkPassphrase


const trustAsset = async function (server,
                                    networkPassphrase, 
                                    supporter, 
                                    supporterKeys, 
                                    asset, 
                                    limit,
                                    ) {
    var transaction = new StellarSdk.TransactionBuilder(supporter, {
        fee: 100,
        networkPassphrase: networkPassphrase,
    })
        // The `changeTrust` operation creates (or alters) a trustline
        // The `limit` parameter below is optional
        .addOperation(
        StellarSdk.Operation.changeTrust({
            asset: asset,
            limit: limit,
        }),
        )
        // setTimeout is required for a transaction
        .setTimeout(100)
        .build();
    console.log("trustAsset: Transaction built")
    transaction.sign(supporterKeys);
    console.log("trustAsset: Transaction signed, now will submit transaction")
    var submitResult = server.submitTransaction(transaction);
    console.log("trustAsset: Tx is being submitted, result: ", submitResult)
    return submitResult
  }


var issuingKeys = StellarSdk.Keypair.fromSecret(settings.issuerSecret);
var supporterKeys = StellarSdk.Keypair.fromSecret(settings.supporterSecret);

console.log("jo")
const supporter = await server.loadAccount(supporterKeys.publicKey())
var asset = new StellarSdk.Asset(asset_code, issuingKeys.publicKey());

const trustAssetResult = await trustAsset(server, 
    settings.networkPassphrase,
    supporter,
    supporterKeys, 
    asset,
    settings.limit)
console.log("Trust tx result: ", trustAssetResult)
