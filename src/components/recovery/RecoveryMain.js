import React from "react";
import Recovery from "../../artifacts/contracts/user/Recovery.sol/Recovery.json";
import Proxy from "../../artifacts/contracts/user/Proxy.sol/Proxy.json";
import DApp from "../../artifacts/contracts/DApp.sol/DApp.json";
import { useState, useEffect } from "react";
import { ethers } from "ethers";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import TextField from "@mui/material/TextField";
import AddDelegate from "./AddDelegate";
import ProposeRecovery from "./ProposeRecovery";

const dappAddress = process.env.REACT_APP_DAPP_ADDRESS;

const userTypes = ["Not a User or Delegate", "User", "Delegate"];
const RecoveryMain = () => {
  const [type, setType] = useState("");
  const [did, setDid] = useState("");
  const [recoveryAddress, setRecoveryAddress] = useState("");
  const [usableDid, setUsableDid] = useState("");

  useEffect(() => {
    // getUser();
    // console.log(parseInt(type._hex, 16))
  }, []);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  // First get the proxy then call it to get the recovery
  async function getRecoveryAddress() {
    setUsableDid(did);
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract1 = new ethers.Contract(dappAddress, DApp.abi, provider);
      try {
        const proxyAddress = await contract1.getPatientProxy(usableDid);
        console.log("Proxy Address: ", proxyAddress);
        const contract2 = new ethers.Contract(
          proxyAddress,
          Proxy.abi,
          provider
        );
        try {
          const recAddress = await contract2.getRecovery();
          console.log("Recovery Address: ", recAddress);
          setRecoveryAddress(recAddress);
          getUser();
        } catch (err) {
          console.log("Error: ", err);
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  // Gets the user type to conditionally render some things
  async function getUser() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Need a signer even though its a viwe function because the function uses msg.sender
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        recoveryAddress,
        Recovery.abi,
        signer
      );
      try {
        // console.log("Recovery trying to get user: ", recoveryAddress)
        setType(await contract.getUserType());
        console.log(parseInt(type?._hex, 16));
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div>
      <Box sx={{ "& button": { m: 1 } }}>
        <TextField
          type="text"
          required
          placeholder="DID"
          value={did}
          onChange={(e) => {
            setDid(e.target.value);
          }}
        />
        <Button variant="contained" onClick={getRecoveryAddress}>
          Submit
        </Button>

        {/* <Button onClick={getUser}>Getting The User</Button> */}
        <h1>
          You are {userTypes[parseInt(type?._hex, 16)]} for DID: {usableDid}
        </h1>
        {parseInt(type?._hex, 16) == 1 ? (
          <>
            <AddDelegate recoveryAddress={recoveryAddress}></AddDelegate>
          </>
        ) : parseInt(type?._hex, 16) == 2 ? (
          <div>
            <ProposeRecovery
              recoveryAddress={recoveryAddress}
            ></ProposeRecovery>
          </div>
        ) : (
          <div>Not authenticated for this contract</div>
        )}
      </Box>
    </div>
  );
};

export default RecoveryMain;
