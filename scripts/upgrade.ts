async function upgrade() {

  const UpgradeableBridgeContractTest = await ethers.getContractFactory("UpgradeableBridgeContractTest");
  const upgradeableBridgeContractTest = await upgrades.upgradeProxy("", UpgradeableBridgeContractTest);
  console.log("UpgradeableBridgeContractTest upgraded" + upgradeableBridgeContractTest.address);
  
}

upgrade();