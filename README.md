# Solidity Demo DApp

This project demonstrates DIDs and the UPort Recovery Smart Contract system. This structure allows patients to entirely own and manage their accounts and data.

DID Documents are created as JSON objects and published to IPFS. The returned hash is stored within the contract. Verifiers can perform DID lookups to find patients and add attesations to the patients DID Document. If a patient loses the private key to their account they can have a delegate initiate a recovery. A vote occurs among delegates and if passed the public key stored in the Controller Contract is changed to the patients new public key.

To launch this Web App first install the dependencies

```shell
npm i
```

In one terminal try running
```shell
npx hardhat node
```

If error occurs run
```shell
npm install --save-dev "@nomicfoundation/hardhat-network-helpers@^1.0.0" "@nomiclabs/hardhat-etherscan@^3.0.0" "@types/mocha@>=9.1.0" "@typechain/ethers-v5@^10.1.0" "@typechain/hardhat@^6.1.2" "hardhat-gas-reporter@^1.0.8" "solidity-coverage@^0.8.1" "ts-node@>=8.0.0" "typechain@^8.1.0" "typescript@>=4.5.0"
```
and then try running this again
```shell
npx hardhat node
```

In a second terminal (with the local blockchain active) run
```shell
npx hardhat run scripts/deploy.js --network localhost
```

Now you are ready to start the webapp. In either the second terminal or new terminal run 
```shell
npm start
```
