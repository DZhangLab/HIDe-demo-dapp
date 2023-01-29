import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import Proxy from "../src/artifacts/contracts/user/Proxy.sol/Proxy.json";
import DApp from "../src/artifacts/contracts/DApp.sol/DApp.json"
import axios from 'axios';

// Update with the contract address logged out to the CLI when it was deployed 
const firstProxyAddress = process.env.REACT_APP_CONTROLLER_ADDRESS;
const dappAddress = process.env.REACT_APP_DAPP_ADDRESS;


function App() {
  const [json, setJson] = useState({});
  const [url, setUrl] = useState("");
  const [did, setDid] = useState("");
  const [attestation, setAttestation] = useState("");
  const [proxyAddress, setProxyAddress] = useState(firstProxyAddress);

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
  }

  async function getProxy() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(dappAddress, DApp.abi, provider)
      try {
        const data = await contract.getPatientProxy(did);
        setProxyAddress(data);
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  // call the smart contract, read the current greeting value
  async function fetchHash() {
    if (typeof window.ethereum !== 'undefined') {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum)
      const contract = new ethers.Contract(proxyAddress, Proxy.abi, provider)
      try {
        const data = await contract.patientHash();
        setUrl(`https://gateway.pinata.cloud/ipfs/${data}`)
        console.log('data: ', data)
      } catch (err) {
        console.log("Error: ", err)
      }
    }    
  }

  

  function retreiveJson() {
    console.log(url)
    return fetch(`${url}`)
    .then((response) => response.json())
    .then((responseJson) => {
      setJson(responseJson)
    })
    .catch((error) => {
      console.error(error);
    });
 }

 async function addAttestation() {
  const newJson = json;
  newJson.attestations.push(attestation);

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      'Content-Type': 'application/json', 
      pinata_api_key: ("e1953363934e9e56a17a"),
      pinata_secret_api_key: ("3cb6745f71a170da981714abd90acc73fb4bf8837751b8e1c1e4fba3f671a15a")
      //'Authorization': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJmZGZkMTdkNy1jOTQwLTRjMjItODAzYi00MjdjNDg3MGRkZTkiLCJlbWFpbCI6ImRpbm5lcmpvaG44NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJpZCI6Ik5ZQzEiLCJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MX1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiZTE5NTMzNjM5MzRlOWU1NmExN2EiLCJzY29wZWRLZXlTZWNyZXQiOiIzY2I2NzQ1ZjcxYTE3MGRhOTgxNzE0YWJkOTBhY2M3M2ZiNGJmODgzNzc1MWI4ZTFjMWU0ZmJhM2Y2NzFhMTVhIiwiaWF0IjoxNjY0NjgwMjYyfQ.VJ7VOyf4QOdQsQZhdAkTaD13Um6GTcsuGh3Ag76bQiI'
    },
    data : newJson
  };

  if (typeof window.ethereum !== "undefined") {
    await requestAccount();
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(
      dappAddress,
      DApp.abi,
      signer
    );

    try {
      const res = await axios(config);

      console.log(res.data)

      const transaction = await contract.addAttestation(await res.data["IpfsHash"], did);
      await transaction.wait();
    } catch (err) {
      console.log("Error: ", err);
    }
  }
}

  return (
    <div className="App">
      <header className="App-header">
        <button onClick={getProxy}>Get Proxy</button>
        <input
          type="text"
          required
          placeholder="DID"
          onChange={(e) => setDid(e.target.value)}
        />

        <button onClick={fetchHash}>Fetch Hash</button>
        <button onClick={retreiveJson}>View DID Document</button>
        <p style={{flex: 1, flexWrap: 'wrap'}}> {JSON.stringify(json)}</p>
  
        <button onClick={addAttestation}>Add Attestation</button>
          <input
          type="text"
          required
          placeholder="DID"
          onChange={(e) => setDid(e.target.value)}
        />
        <input
          type="text"
          required
          placeholder="Attestation"
          onChange={(e) => setAttestation(e.target.value)}
        />
      </header>
      
    </div>
  );
}

export default App;