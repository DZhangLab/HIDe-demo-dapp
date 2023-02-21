const hre = require("hardhat");
const axios =  require("axios");



async function main() { 
  const accounts = await hre.ethers.getSigners();

  
 
  const DApp = await hre.ethers.getContractFactory("DApp");
  const dapp = DApp.connect(accounts[0]).deploy();


  const hashData1 = await createAndPublishDIDJson("did:hide:abc123", "did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a", "0xb9c5714089478a327f09197987f16f9e5d936e8a@eip155:1", Date.now(), "did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a#controller");
  const hash1 = hashData1["IpfsHash"]
  console.log('Hash 1: ', hash1)
  const Controller1 = await hre.ethers.getContractFactory("Controller");
  const controller1 = Controller1.connect(accounts[1]).deploy(
    (await dapp).address,
    "abc123", //temporary DID
    (await hash1)
  );

  const hashData2 = await createAndPublishDIDJson("did:hide:def456", "did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a", "0xb9c5714089478a327f09197987f16f9e5d936e8a@eip155:1", Date.now(), "did:hide:0xb9c5714089478a327f09197987f16f9e5d936e8a#controller");
  const hash2 = hashData2["IpfsHash"]
  console.log('Hash 2: ', hash2)
  const Controller2 = await hre.ethers.getContractFactory("Controller");
  const controller2 = Controller2.connect(accounts[2]).deploy(
    (await dapp).address,
    "def456", //temporary DID
    (await hash2)
  );
 
  console.log(
    "DApp Contract deployed to: ",
    (await dapp).address
  );
  console.log("Controller1 Contract deployed to: ", (await controller1).address);
  console.log("Controller2 Contract deployed to: ", (await controller2).address);
  
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
    pinata_api_key: ("c0e2dd6b45a6227d90d5"),
    pinata_secret_api_key: ("2a48f55499ccea10aa77e58f3ad7a6212ae46b42ceff1befa0060a07a811f8b6")
    //'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmZGZkMTdkNy1jOTQwLTRjMjItODAzYi00MjdjNDg3MGRkZTkiLCJlbWFpbCI6ImRpbm5lcmpvaG44NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTE5NTMzNjM5MzRlOWU1NmExN2EiLCJzY29wZWRLZXlTZWNyZXQiOiIzY2I2NzQ1ZjcxYTE3MGRhOTgxNzE0YWJkOTBhY2M3M2ZiNGJmODgzNzc1MWI4ZTFjMWU0ZmJhM2Y2NzFhMTVhIiwiaWF0IjoxNjY0NjgwMjYyfQ.VJ7VOyf4QOdQsQZhdAkTaD13Um6GTcsuGh3Ag76bQiI'
  },
  data : data
};

const res = await axios(config);

//setHash(res.data["IpfsHash"])

return res.data

}