import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Contract cases", function () {
  async function deployContractsInstances() {
    const [owner, otherAccount] = await ethers.getSigners();

    const KOVACToken = await ethers.getContractFactory("VickishToken");
    const token = await KOVACToken.deploy();

    const SaveERC20orEther = await ethers.getContractFactory(
      "SaveERC20orEther"
    );
    const saveERC20orEther = await SaveERC20orEther.deploy(token.target);

    return { token, saveERC20orEther, owner, otherAccount };
  }

  describe("Contracts Deployments", function () {
    it("Should pass if VickishToken contract has deployed succesffully", async function () {
      const { token } = await loadFixture(deployContractsInstances);

      expect(token).to.exist;
    });
    it("Should pass if SaveERC20orEther contract has deployed succesffully", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);

      expect(saveERC20orEther).to.exist;
    });
  });

  describe("Deposit token", function () {
    it("Should pass with revertedWith, when attempted to deposit with amount equal 0", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);
      const tx = saveERC20orEther.tokendeposit(0);
      await expect(tx).to.be.revertedWith("can't save zero value");
    });

    it("Should pass with revertedWithCustomError from VickishToken, when attempted to deposit without approval to spend token or having token type", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);
      const tx = saveERC20orEther.tokendeposit(100);
      //  ERC20InsufficientAllowance
      expect(tx).to.be.revertedWithCustomError;
    });

    it("Should pass an emit after successful transaction", async function () {
      const { saveERC20orEther, token } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 100);
      console.log(saveERC20orEther.target);

      const tx = saveERC20orEther.tokendeposit(100);

      expect(tx).to.emit;
    });

    it("Should increase contract's balance on safe deposit", async function () {
      const { saveERC20orEther, token } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 100);
      await saveERC20orEther.tokendeposit(50);
      const bal = await saveERC20orEther.tokenContractBalance();
      expect(bal).to.equal(50);
    });

    it("Should pass with revertedWithCustomError, when attempted to deposit with amount greater than users owned token", async function () {
      const { saveERC20orEther, token, owner } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 100);
      const tx = saveERC20orEther.tokendeposit(1000);
      expect(tx).to.be.revertedWithCustomError;
    });
  });

  describe("Withdraw Token", function () {
    it("Should pass with rejected, when attempted to withdraw amount equal 0", async function () {
      const { saveERC20orEther, token } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 100);
      await saveERC20orEther.tokendeposit(100);
      const tx = saveERC20orEther.tokenWithdraw(0);
      await expect(tx).to.be.rejectedWith("can't withdraw zero value");
    });

    it("Should pass with rejected, when attempted to withdraw amount above what was deposited", async function () {
      const { saveERC20orEther, token } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 100);
      await saveERC20orEther.tokendeposit(100);
      const tx = saveERC20orEther.tokenWithdraw(200);
      await expect(tx).to.be.revertedWith("insufficient funds");
    });
    it("Should return valid amount remaining as user's balance after withdrawal", async function () {
      const { saveERC20orEther, token, owner } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 100);
      await saveERC20orEther.tokendeposit(100);
      await saveERC20orEther.tokenWithdraw(50);
      const finalBal = await saveERC20orEther.tokenContractBalance();
      expect(finalBal).to.equal(50);
    });
    it("Should emit after successful withdrawal", async function () {
      const { saveERC20orEther, token } = await loadFixture(
        deployContractsInstances
      );
      await token.approve(saveERC20orEther.target, 200);
      await saveERC20orEther.tokendeposit(100);
      const tx = await saveERC20orEther.tokenWithdraw(20);
      expect(tx).to.emit;
    });
  });

  describe("Deposit Ether", function () {
    it("Should be able to deposit", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);
      await saveERC20orEther.etherdeposit({ value: ethers.parseEther("1") });
      const balance = await saveERC20orEther.etherContractBal();
      expect(balance).to.equal(1000000000000000000n);
    });

    it("Should revert when trying deposit zero value", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);

      await expect(
        saveERC20orEther.etherdeposit({ value: 0 })
      ).to.be.revertedWith("can't save zero value");
    });
  });

  describe("Withdraw Ether", function () {
    it("Should be able to withdraw", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);

      await saveERC20orEther.etherdeposit({ value: ethers.parseEther("1") });
      const bal = await saveERC20orEther.etherWithdraw();
      expect(bal.value).to.equal(0);
    });

    it("Amount should be greater than zero", async function () {
      const { saveERC20orEther } = await loadFixture(deployContractsInstances);
      expect(saveERC20orEther.etherWithdraw()).to.be.rejectedWith(
        "you don't have any savings"
      );
    });
  });
});
