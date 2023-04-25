const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const hre = require("hardhat");

describe("Basic", function () {
  const deployDapp = async () => {
    const accounts = await hre.ethers.getSigners();
    const DApp = await hre.ethers.getContractFactory("DApp");
    const dapp = DApp.connect(accounts[0]).deploy();
    return { dapp, accounts };
  };

  const deployPatients = async () => {
    const { dapp, accounts } = await loadFixture(deployDapp);

    const hash1 = "nothingToNotMakeManyCalls_1";
    // const hash1 = hashData1["IpfsHash"]
    console.log("Hash 1: ", hash1);
    const Controller1 = await hre.ethers.getContractFactory("Controller");
    const controller1 = Controller1.connect(accounts[1]).deploy(
      (await dapp).address,
      "abc123", //temporary DID
      await hash1
    );

    // const hashData2 = await createAndPublishDIDJson("did:hide:def456", (await dapp).address, "none", Date.now());
    const hash2 = "nothingToNotMakeManyCalls_2";
    // const hash2 = hashData2["IpfsHash"]
    console.log("Hash 2: ", hash2);
    const Controller2 = await hre.ethers.getContractFactory("Controller");
    const controller2 = Controller2.connect(accounts[2]).deploy(
      (await dapp).address,
      "def456", //temporary DID
      await hash2
    );

    return { dapp, controller1, controller2, accounts };
  };

  // describe("TestConsumer", async function () {
  //   it("Should be able to add consumer only from owner", async function () {
  //     const { dapp, controller1, controller2, accounts } = await loadFixture(
  //       deployPatients
  //     );

  //     await expect(
  //       (await dapp)
  //         .connect(accounts[1])
  //         .addConsumer("consumer10", accounts[10].address)
  //     ).to.be.revertedWith("You are not the owner");

  //     await expect(
  //       (await dapp)
  //         .connect(accounts[0])
  //         .addConsumer("consumer10", accounts[10].address)
  //     ).not.to.be.reverted;
  //   });

  //   it("Adding Data to patient", async function () {
  //     const { dapp, controller1, controller2, accounts } = await loadFixture(
  //       deployPatients
  //     );

  //     await expect(
  //       (await dapp)
  //         .connect(accounts[0])
  //         .addVerifier("verifier11", accounts[11].address)
  //     ).not.to.be.reverted;

  //     // Non Verifier Trying to add data
  //     await expect(
  //       (await dapp)
  //         .connect(accounts[1])
  //         .addAttestation("abc123", "imaginaryHash")
  //     ).to.be.revertedWith("DOES_NOT_HAVE_VERIFIER_ROLE");

  //     // Verifier Trying to add data
  //     await expect(
  //       (await dapp)
  //         .connect(accounts[11])
  //         .addAttestation("imaginaryHash", "abc123")
  //     ).not.to.be.reverted;

  //     // Checking that the patients controller hash is correct
  //     const proxyAddress = (await controller1).getProxyAddress();

  //     const Proxy = await ethers.getContractFactory("Proxy");
  //     const proxy = await Proxy.attach(proxyAddress);

  //     let newHash = "imaginaryHash";
  //     await expect(await (await proxy).patientHash()).to.equal(newHash);
  //   });
  // });

  describe("TestRecovery", async function () {
    it("Patient Adding Delegate", async function () {
      const { dapp, controller1, controller2, accounts } = await loadFixture(
        deployPatients
      );

      // First we need to get the proxy address of the patient
      const proxyAddress = await (await controller1).getProxyAddress();

      const Proxy = await ethers.getContractFactory("Proxy");
      const proxy = await Proxy.attach(proxyAddress);

      // Next we need to get the recovery address
      const recoveryAddress = await proxy.getRecovery();
      console.log(await recoveryAddress);

      // Getting recovery contract of patient
      const Recovery = await ethers.getContractFactory("Recovery");
      const recovery = await Recovery.attach(recoveryAddress);

      // Non Patient Trying to add delegate
      await expect(
        (await recovery).connect(accounts[2]).addDelegate(accounts[3].address)
      ).to.be.revertedWith("You are not the user");

      // Patient adding delegate delegate
      await expect(
        (await recovery).connect(accounts[1]).addDelegate(accounts[3].address)
      ).not.to.be.reverted;

      await expect(
        (await recovery).connect(accounts[1]).addDelegate(accounts[4].address)
      ).not.to.be.reverted;

      // Delegate creating proposal
      await expect(
        (await recovery)
          .connect(accounts[1])
          .proposeRecovery(accounts[5].address)
      ).to.be.revertedWith("You are not a permitted delegate");

      await expect(
        (await recovery)
          .connect(accounts[3])
          .proposeRecovery(accounts[5].address)
      ).not.to.be.reverted;

      // Checking current status, should be pending
      // await expect(await (await recovery).proposal().status()).to.equal(newHash);
      console.log("Status :", await (await recovery).proposal.status);

      // Other delegate voting yes on proposal
      await expect((await recovery).connect(accounts[4]).voteProposal(1)).not.to
        .be.reverted;

      // This should make the proposal pass since their is majority vote
      // We can now check that the address of controller1 is accounts[5].address

      // console.log("User Address: ", await (await controller1).userAddress());
      await expect(await (await controller1).userAddress()).to.equal(
        accounts[5].address
      );
    });
  });
});

// describe("Lock", function () {
//   // We define a fixture to reuse the same setup in every test.
//   // We use loadFixture to run this setup once, snapshot that state,
//   // and reset Hardhat Network to that snapshot in every test.
//   async function deployOneYearLockFixture() {
//     const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
//     const ONE_GWEI = 1_000_000_000;

//     const lockedAmount = ONE_GWEI;
//     const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

//     // Contracts are deployed using the first signer/account by default
//     const [owner, otherAccount] = await ethers.getSigners();

//     const Lock = await ethers.getContractFactory("Lock");
//     const lock = await Lock.deploy(unlockTime, { value: lockedAmount });

//     return { lock, unlockTime, lockedAmount, owner, otherAccount };
//   }

//   describe("Deployment", function () {
//     it("Should set the right unlockTime", async function () {
//       const { lock, unlockTime } = await loadFixture(deployOneYearLockFixture);

//       expect(await lock.unlockTime()).to.equal(unlockTime);
//     });

//     it("Should set the right owner", async function () {
//       const { lock, owner } = await loadFixture(deployOneYearLockFixture);

//       expect(await lock.owner()).to.equal(owner.address);
//     });

//     it("Should receive and store the funds to lock", async function () {
//       const { lock, lockedAmount } = await loadFixture(
//         deployOneYearLockFixture
//       );

//       expect(await ethers.provider.getBalance(lock.address)).to.equal(
//         lockedAmount
//       );
//     });

//     it("Should fail if the unlockTime is not in the future", async function () {
//       // We don't use the fixture here because we want a different deployment
//       const latestTime = await time.latest();
//       const Lock = await ethers.getContractFactory("Lock");
//       await expect(Lock.deploy(latestTime, { value: 1 })).to.be.revertedWith(
//         "Unlock time should be in the future"
//       );
//     });
//   });

//   describe("Withdrawals", function () {
//     describe("Validations", function () {
//       it("Should revert with the right error if called too soon", async function () {
//         const { lock } = await loadFixture(deployOneYearLockFixture);

//         await expect(lock.withdraw()).to.be.revertedWith(
//           "You can't withdraw yet"
//         );
//       });

//       it("Should revert with the right error if called from another account", async function () {
//         const { lock, unlockTime, otherAccount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // We can increase the time in Hardhat Network
//         await time.increaseTo(unlockTime);

//         // We use lock.connect() to send a transaction from another account
//         await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
//           "You aren't the owner"
//         );
//       });

//       it("Shouldn't fail if the unlockTime has arrived and the owner calls it", async function () {
//         const { lock, unlockTime } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         // Transactions are sent using the first signer by default
//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).not.to.be.reverted;
//       });
//     });

//     describe("Events", function () {
//       it("Should emit an event on withdrawals", async function () {
//         const { lock, unlockTime, lockedAmount } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw())
//           .to.emit(lock, "Withdrawal")
//           .withArgs(lockedAmount, anyValue); // We accept any value as `when` arg
//       });
//     });

//     describe("Transfers", function () {
//       it("Should transfer the funds to the owner", async function () {
//         const { lock, unlockTime, lockedAmount, owner } = await loadFixture(
//           deployOneYearLockFixture
//         );

//         await time.increaseTo(unlockTime);

//         await expect(lock.withdraw()).to.changeEtherBalances(
//           [owner, lock],
//           [lockedAmount, -lockedAmount]
//         );
//       });
//     });
//   });
// });
