import React from 'react'
import Recovery from '../../artifacts/contracts/user/Recovery.sol/Recovery.json'
import { useState, useEffect } from 'react';
import { ethers } from 'ethers'
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Box } from '@mui/material';
import TextField from '@mui/material/TextField';


const AddDelegate = ({recoveryAddress}) => {
    const [address, setAddress] = useState("") //delegate address
    
    useEffect(() => {
        // getUser();
        // console.log(parseInt(type._hex, 16))
    }, [])

    async function requestAccount() {
        await window.ethereum.request({ method: "eth_requestAccounts" });
      }
    
    // Lets the user add delegates
    async function addDelegate() {
        if (typeof window.ethereum !== "undefined") {
          await requestAccount();
          const provider = new ethers.providers.Web3Provider(window.ethereum);
    
          const signer = provider.getSigner();
          const contract = new ethers.Contract(
            recoveryAddress,
            Recovery.abi,
            signer
          );
          try {
            console.log(address)
            const transaction = await contract.addDelegate(address);
            await transaction.wait();
            console.log("Added: ", address)
          } catch (err) {
            console.log("Error: ", err);
          }
        }
      }
  return (
    <div>
      
      <h2>Add Delegate</h2>

        <TextField
        type="text"
        required
        placeholder="Delegate Address"
        onChange={(e) => setAddress(e.target.value)}
        />
        <Button onClick={addDelegate}>
            Add
        </Button>
            </div>
  );
};

export default AddDelegate;