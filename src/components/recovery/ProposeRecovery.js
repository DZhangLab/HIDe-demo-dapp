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
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";

const ProposeRecovery = ({ recoveryAddress }) => {
  const [proposal, setProposal] = useState([]);
  const [vote, setVote] = useState(0);

  const [address, setAddress] = useState("");

  useEffect(() => {
    getRecovery();
    console.log(proposal);
  }, []);

  function voteNo() {
    setVote(0);
    voteProposal();
  }
  function voteYes() {
    setVote(1);
    voteProposal();
  }

  // uses metamask injected browser window to make sure consumer has a connected account
  async function requestAccount() {
    await window.ethereum.request({ method: "eth_requestAccounts" });
  }

  async function proposeRecovery() {
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
        const transaction = await contract.proposeRecovery(address);
        await transaction.wait();
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function voteProposal() {
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
        const transaction = await contract.voteProposal(vote);
        await transaction.wait();
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  async function getRecovery() {
    if (typeof window.ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const contract = new ethers.Contract(
        recoveryAddress,
        Recovery.abi,
        provider
      );
      try {
        setProposal(await contract.getProposal());
        console.log(proposal);
      } catch (err) {
        console.log("Error: ", err);
      }
    }
  }

  return (
    <div className="App">
      <h2>Start the Recovery Process</h2>
      <h6>
        The user lost their private key and they contacted you off chain. You
        have verified that authenticy of this request. By starting the recovery
        process you will create a proposal to change the current user public
        address to a new address. This address should be supplied by the user.
        Once proposed, delegates will have one week to vote. If vote yes has 50%
        or more, the address will automatically changed. Otherwise, the proposal
        will expire after 1 week and the address will change if the yes votes is
        greater than or equal to no votes.
      </h6>

      <TextField
        type="text"
        required
        placeholder="New User Address"
        onChange={(e) => setAddress(e.target.value)}
      />
      <Button onClick={proposeRecovery}>Propose</Button>
      <br></br>
      <br></br>
      {proposal != [] ? (
        <>
          {" "}
          <Container>
            <Card variant="outlined" sx={{ minWidth: 275 }}>
              <CardContent>
                <Typography variant="h4" color="text.secondary" gutterBottom>
                  Current Proposal
                </Typography>
                <Typography variant="h6" component="div">
                  New Address: {proposal ? proposal[1] : null}
                </Typography>
                <Typography variant="h6" component="div">
                  Proposal Created By: {proposal ? proposal[0] : null}
                </Typography>
                <Typography variant="h7" component="div">
                  Votes No: {parseInt(proposal?.voteNo?._hex, 16)}
                </Typography>
                <Typography variant="h7" component="div">
                  Votes Yes: {parseInt(proposal?.voteYes?._hex, 16)}
                </Typography>
                <Typography variant="h7" component="div">
                  Status:{" "}
                  {parseInt(proposal?.status?._hex, 16) == 0
                    ? "Cancelled"
                    : parseInt(proposal?.status?._hex, 16) == 1
                    ? "Pending"
                    : "Cancelled"}
                </Typography>
              </CardContent>
              <CardActions>
                <Button onClick={voteYes}>Vote Yes</Button>
                <Button onClick={voteNo}>Vote No</Button>
              </CardActions>
            </Card>
          </Container>
        </>
      ) : null}
    </div>
  );
};

export default ProposeRecovery;
