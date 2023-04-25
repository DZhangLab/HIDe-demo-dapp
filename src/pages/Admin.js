import React from "react";
import DApp from "../../src/artifacts/contracts/DApp.sol/DApp.json";
import { useState } from "react";
import { ethers } from "ethers";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";

const dappAddress = process.env.REACT_APP_DAPP_ADDRESS;

function Admin() {
  const [did, setDid] = useState("");
  const [address, setAddress] = useState("");
  const [verifier, setVerifier] = useState("");
  const [verifierDid, setVerifierDid] = useState("");

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function addConsumer() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(dappAddress, DApp.abi, signer);
      try {
        await contract.addConsumer(did, address);
        console.log("Sucessfully Added: ", did);
        setDid("");
        setAddress("");
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function addVerifier() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(dappAddress, DApp.abi, signer);
      try {
        await contract.addVerifier(verifierDid, verifier);
        console.log("Sucessfully Added: ", did);
        setDid("");
        setVerifier("");
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div className="App">
      <br></br>
      <Typography variant="h2" gutterBottom>
        Add Consumer
      </Typography>

      <Box sx={{ "& button": { m: 1 } }}>
        <Button variant="contained" onClick={addConsumer}>
          Add Consumer
        </Button>
        <TextField
          type="text"
          required
          placeholder="DID"
          value={did}
          onChange={(e) => {
            setDid(e.target.value);
          }}
        />
        <TextField
          type="text"
          required
          placeholder="Public Key"
          value={address}
          onChange={(e) => {
            setAddress(e.target.value);
          }}
        />
      </Box>
      <br />
      <Typography variant="h2" gutterBottom>
        Add Verifier
      </Typography>

      <Box sx={{ "& button": { m: 1 } }}>
        <Button variant="contained" onClick={addVerifier}>
          Add Verifier
        </Button>
        <TextField
          type="text"
          required
          placeholder="DID"
          value={verifierDid}
          onChange={(e) => {
            setVerifierDid(e.target.value);
          }}
        />
        <TextField
          type="text"
          required
          placeholder="Public Key"
          value={verifier}
          onChange={(e) => {
            setVerifier(e.target.value);
          }}
        />
      </Box>
    </div>
  );
}

export default Admin;
