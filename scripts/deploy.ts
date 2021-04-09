const { ethers, upgrades } = require("hardhat")

async function deploy() {

  const TutorialToken = await ethers.getContractFactory("TutorialToken");
  const tutorialToken = await upgrades.deployProxy(TutorialToken, [100]);
  await tutorialToken.deployed();

  console.log("TutorialToken deployed to:", tutorialToken.address);

  const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract");
  const upgradeableBridgeContract = await upgrades.deployProxy(UpgradeableBridgeContract, [tutorialToken.address]);
  await upgradeableBridgeContract.deployed();

  console.log("UpgradeableBridgeContract deployed to:", upgradeableBridgeContract.address);
}

deploy();
