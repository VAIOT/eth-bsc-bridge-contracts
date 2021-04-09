async function upgrade() {

  const UpgradeableBridgeContractTest = await ethers.getContractFactory("UpgradeableBridgeContractTest");
  const upgradeableBridgeContractTest = await upgrades.upgradeProxy(process.env.CONTRACT_ADDRESS, UpgradeableBridgeContractTest);
  console.log("UpgradeableBridgeContractTest upgraded" + upgradeableBridgeContractTest.address);
  
}

upgrade();