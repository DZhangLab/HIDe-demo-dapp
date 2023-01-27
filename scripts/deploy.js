const hre = require("hardhat");
const axios =  require("axios");



async function main() { 
  const accounts = await hre.ethers.getSigners();

  const hashData = await createAndPublishDIDJson("did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a", "did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a", "0xb9c5714089478a327f09197987f16f9e5d936e8a@eip155:1", Date.now(), "did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a#controller");
  const hash = hashData["IpfsHash"]
 
  const DApp = await hre.ethers.getContractFactory("DApp");
  const dapp = DApp.connect(accounts[0]).deploy();

  console.log(hash)

  const Controller = await hre.ethers.getContractFactory("Controller");
  const controller = Controller.connect(accounts[1]).deploy(
    (await dapp).address,
    "abc123", //temporary DID
    (await hash)
  );
 
  console.log(
    "DApp Contract deployed to: ",
    (await dapp).address
  );
  console.log("Controller Contract deployed to: ", (await controller).address);
  
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Function to create and publish the DID Document to 
async function createAndPublishDIDJson(DID, controller, blockchainAccountID, timestamp, authentication) {

  var data = JSON.stringify({
    "@context": "https://www.w3.org/ns/did/v1",
    "id": DID,
    "verificationMethod": [
  {
          "id": DID,
      "type": "EcdsaSecp256k1RecoveryMethod2020",
      "controller":       controller,
      "blockchainAccountId": blockchainAccountID
        }
      ],
    "created": timestamp,
    "updated": timestamp,
    "deactivated": false,
    

    "authentication": [authentication],
    "attestations":[] // Added this to store attestations

}
);

var config = {
  method: 'post',
  url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
  headers: { 
    'Content-Type': 'application/json', 
    pinata_api_key: ("e1953363934e9e56a17a"),
    pinata_secret_api_key: ("3cb6745f71a170da981714abd90acc73fb4bf8837751b8e1c1e4fba3f671a15a")
    //'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmZGZkMTdkNy1jOTQwLTRjMjItODAzYi00MjdjNDg3MGRkZTkiLCJlbWFpbCI6ImRpbm5lcmpvaG44NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTE5NTMzNjM5MzRlOWU1NmExN2EiLCJzY29wZWRLZXlTZWNyZXQiOiIzY2I2NzQ1ZjcxYTE3MGRhOTgxNzE0YWJkOTBhY2M3M2ZiNGJmODgzNzc1MWI4ZTFjMWU0ZmJhM2Y2NzFhMTVhIiwiaWF0IjoxNjY0NjgwMjYyfQ.VJ7VOyf4QOdQsQZhdAkTaD13Um6GTcsuGh3Ag76bQiI'
  },
  data : data
};

const res = await axios(config);

//setHash(res.data["IpfsHash"])

return res.data

}