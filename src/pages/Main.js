import ".././App.css";
import { useState } from "react";
import { ethers } from "ethers";
import Proxy from "../../src/artifacts/contracts/user/Proxy.sol/Proxy.json";
import DApp from "../../src/artifacts/contracts/DApp.sol/DApp.json";
import axios from "axios";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import ReactJson from "react-json-view";
import CryptoJS from "crypto-js";

// Update with the contract address logged out to the CLI when it was deployed
const firstProxyAddress = process.env.REACT_APP_CONTROLLER_ADDRESS;
const dappAddress = process.env.REACT_APP_DAPP_ADDRESS;

function Main() {
  const [json, setJson] = useState({});
  const [url, setUrl] = useState("");
  const [did, setDid] = useState("");
  const [usableDid, setUsableDid] = useState("");
  const [attestation, setAttestation] = useState("");
  const [proxyAddress, setProxyAddress] = useState(firstProxyAddress);
  const [address, setAddress] = useState("");

  // request access to the user's MetaMask account
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function getProxy() {
    const submitDid = await confirmDid();
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(dappAddress, DApp.abi, provider);
      try {
        console.log("UsableDID: ", submitDid);
        const data = await contract.getPatientProxy(submitDid);
        setProxyAddress(data);
        console.log("data: ", data);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  // call the smart contract, read the current greeting value
  async function fetchHash() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract = new ethers.Contract(proxyAddress, Proxy.abi, provider);
      try {
        const data = await contract.patientHash();
        setUrl(`https://gateway.pinata.cloud/ipfs/${data}`);
        console.log("data: ", data);
        retreiveJson(`https://gateway.pinata.cloud/ipfs/${data}`);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  function confirmDid() {
    setUsableDid(did);
    const temp = did;
    setDid("");
    return temp;
  }

  function retreiveJson(passedUrl) {
    console.log(passedUrl);
    return fetch(`${passedUrl}`)
      .then((response) => response.json())
      .then((responseJson) => {
        setJson(responseJson);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  async function addAttestation() {
    getProxy();
    fetchHash();
    retreiveJson();

    if (json === "") {
      console.log("Empty JSON");
    }
    console.log(json);
    const newJson = json;

    // Add any necessary updates
    newJson.updated = Date.now();
    if (newJson.verificationMethod[0].blockchainAccountId === "none") {
      newJson.verificationMethod[0].blockchainAccountId = proxyAddress;
    }
    const encryptedAttestation = CryptoJS.AES.encrypt(
      attestation,
      "secret key"
    ).toString();

    newJson.attestations.push({ data: encryptedAttestation, keyId: "temp1" });

    var config = {
      method: "post",
      url: "https://api.pinata.cloud/pinning/pinJSONToIPFS",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: "c0e2dd6b45a6227d90d5",
        pinata_secret_api_key:
          "2a48f55499ccea10aa77e58f3ad7a6212ae46b42ceff1befa0060a07a811f8b6",
        Accept: "text/plain",
      },
      data: newJson,
    };

    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      console.log("Signer: ", signer);
      const contract = new ethers.Contract(dappAddress, DApp.abi, signer);

      console.log(newJson);
      try {
        const res = await axios(config);

        console.log(res.data);

        const transaction = await contract.addAttestation(
          await res.data["IpfsHash"],
          usableDid
        );
        await transaction.wait();
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div className="App">
      <br></br>
      <Typography variant="h2" gutterBottom>
        DID Document
      </Typography>
      <TextField
        type="text"
        required
        placeholder="DID"
        value={did}
        onChange={(e) => {
          setDid(e.target.value);
          setUsableDid("");
        }}
      />
      <Box sx={{ "& button": { m: 1 } }}>
        {/* <Button variant="contained" onClick={confirmDid}>
          Confirm DID
        </Button> */}

        <Button variant="contained" onClick={getProxy}>
          Confirm DID
        </Button>
        <Button variant="contained" onClick={fetchHash}>
          View DID Document
        </Button>
        {/* <Button variant="contained" onClick={retreiveJson}>
          View DID Document
        </Button> */}
        {/* <p style={{ flex: 1, flexWrap: "wrap" }}> {JSON.stringify(json)}</p> */}
        <h3>
          <ReactJson
            src={json}
            name="DID Document"
            collapsed={true}
            displayDataTypes={false}
            displayObjectSize={false}
            enableClipboard={false}
            iconStyle="square"
          />
        </h3>
        <Button variant="contained" onClick={addAttestation}>
          Add Attestation
        </Button>
        <TextField
          type="text"
          required
          placeholder="Attestation"
          onChange={(e) => setAttestation(e.target.value)}
        />
      </Box>
    </div>
  );
}

export default Main;
