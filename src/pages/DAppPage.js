// Currently not in use

import { useState } from 'react';
import { ethers } from 'ethers'
import DApp from "../artifacts/contracts/DApp.sol/DApp.json"

// Update with the contract address logged out to the CLI when it was deployed 
const dappAddress = process.env.REACT_APP_DAPP_ADDRESS;

const AddAttestation = () => {
    const [did, setDid] = useState("");
    const [attestation, setAttestation] = useState("");

    async function requestAccount() {
        await window.ethereum.request({ method: "eth_requestAccounts" });
    }

    async function addAttestation() {
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
            const transaction = await contract.addAttestation(did, attestation);
            await transaction.wait();
          } catch (err) {
            console.log("Error: ", err);
          }
        }
      }
      return (
        <div>
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
          <br></br>
          <div>
    
          </div>
      
        </div>
      );

}

export default AddAttestation;