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

const userTypes = ["not a user or delegate", "user", "delegate"];
const RecoveryMain = () => {
  const [type, setType] = useState("");
  const [did, setDid] = useState("");
  const [recoveryAddress, setRecoveryAddress] = useState("");
  const [usableDid, setUsableDid] = useState("");

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
    }
  }, []);

  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  // First get the proxy then call it to get the recovery
  async function getRecoveryAddress() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const contract1 = new ethers.Contract(dappAddress, DApp.abi, provider);
      try {
        const proxyAddress = await contract1.getPatientProxy(did);
        console.log("Proxy Address: ", proxyAddress);
        const contract2 = new ethers.Contract(
          await proxyAddress,
          Proxy.abi,
          provider
        );
        try {
          const recAddress = await (await contract2).getRecovery();
          console.log("Recovery Address: ", recAddress);
          setRecoveryAddress(recAddress);
          getUser(await recAddress);
        } catch (err) {
          console.log("Error: ", err);
        }
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  // Gets the user type to conditionally render some things
  async function getUser(recAddr) {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      // Need a signer even though its a viwe function because the function uses msg.sender
      const signer = provider.getSigner();
      console.log("Rec Address: ", recAddr);
      const contract = new ethers.Contract(recAddr, Recovery.abi, signer);
      try {
        // console.log("Recovery trying to get user: ", recoveryAddress)
        const type = await contract.getUserType();
        setType(type);
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
          {type == "" ? (
            <div>Submit a DID to see your role</div>
          ) : (
            <>
              You are {userTypes[parseInt(type?._hex, 16)]} for DID: {usableDid}
            </>
          )}
        </h1>
        {parseInt(type?._hex, 16) == 1 ? (
          <>
            <AddDelegate recoveryAddress={recoveryAddress}></AddDelegate>
          </>
        ) : parseInt(type?._hex, 16) == 2 ? (
          <>
            <ProposeRecovery
              recoveryAddress={recoveryAddress}
            ></ProposeRecovery>
          </>
        ) : (
          <div>Currently not authenticated for this user</div>
        )}
      </Box>
    </div>
  );
};

export default RecoveryMain;
