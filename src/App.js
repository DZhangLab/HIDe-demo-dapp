import './App.css';
import { useState } from 'react';
import { ethers } from 'ethers'
import Proxy from "../src/artifacts/contracts/user/Proxy.sol/Proxy.json";
import DApp from "../src/artifacts/contracts/DApp.sol/DApp.json"
import axios from 'axios';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';

// Update with the contract address logged out to the CLI when it was deployed 
const firstProxyAddress = process.env.REACT_APP_CONTROLLER_ADDRESS;
const dappAddress = process.env.REACT_APP_DAPP_ADDRESS;


function App() {
  const [json, setJson] = useState({});
  const [url, setUrl] = useState("");
  const [did, setDid] = useState("");
  const [usableDid, setUsableDid] = useState("")
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
        console.log("Here")
        const data = await contract.getPatientProxy(usableDid);
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

  function confirmDid(){
    setUsableDid(did)
    setDid("")
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

  getProxy()
  fetchHash()
  retreiveJson()
  
  if(json === ""){
    console.log("Empty JSON")
  }
  console.log(json)
  const newJson = json;
  newJson.attestations.push(attestation);

  var config = {
    method: 'post',
    url: 'https://api.pinata.cloud/pinning/pinJSONToIPFS',
    headers: { 
      'Content-Type': 'application/json', 
      pinata_api_key: ("c0e2dd6b45a6227d90d5"),
      pinata_secret_api_key: ("2a48f55499ccea10aa77e58f3ad7a6212ae46b42ceff1befa0060a07a811f8b6"),
      Accept: "text/plain",
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

      const transaction = await contract.addAttestation(await res.data["IpfsHash"], usableDid);
      await transaction.wait();
    } catch (err) {
      console.log("Error: ", err);
    }
  }
}

  return (
    <div className="App">
      <header className="App-header">
      <Typography variant="h2" gutterBottom>
        DID Document Testing
      </Typography>
        <TextField
          type="text"
          required
          placeholder="DID"
          value={did}
          onChange={(e) => {setDid(e.target.value); setUsableDid("")}}
        />
        <Box sx={{ '& button': { m: 1 } }}>
        <Button variant="contained"  onClick={confirmDid}>Confirm DID</Button>

        <Button variant="contained"  onClick={getProxy}>Get Proxy</Button>
        <Button variant="contained"  onClick={fetchHash}>Fetch Hash</Button>
        <Button variant="contained"  onClick={retreiveJson}>View DID Document</Button>
        <p style={{flex: 1, flexWrap: 'wrap'}}> {JSON.stringify(json)}</p>

        <Button variant="contained" onClick={addAttestation}>Add Attestation</Button>
        <TextField
          type="text"
          required
          placeholder="Attestation"
          onChange={(e) => setAttestation(e.target.value)}
        />  
        </Box>
        
      </header>
      
    </div>
  );
}

export default App;