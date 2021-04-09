
import chai from "chai"
import { solidity } from "ethereum-waffle"
import { UpgradeableBridgeContract, TutorialToken } from "../typechain"
import TutorialTokenArtifact from "../artifacts/contracts/TutorialToken.sol/TutorialToken.json"

const { ethers, upgrades, waffle } = require("hardhat")
const { expect } = chai
const { deployContract } = waffle

chai.use(solidity)

const relayerAddress = "0x70997970c51812dc3a010c7d01b50e0d17dc79c8"
const signatureOwner = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
const signature = "0x0c9b7b0c2bc9f118c8309b68e6a2585148488c5207dee655f97504714474408820407833525c735d8d287dc4b8b9fcb3bd0c1da19f82ef951bba76e208c95f701b"

describe('UpgradeableBridgeContract', () => {

    describe('1. Before deployment', () => {
        it('1.1. should fail when trying to deploy with wrong argument types', async () => {
            const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract")

            await expect(upgrades.deployProxy(UpgradeableBridgeContract, ['token.address'])).to.be.reverted
            await expect(upgrades.deployProxy(UpgradeableBridgeContract, [0])).to.be.reverted
        })

        it('1.2. should revert when the token address is not a contract', async () => {
            const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract")
            const [addr1] = await ethers.getSigners()

            await expect(upgrades.deployProxy(UpgradeableBridgeContract, [addr1])).to.be.reverted
        })

        it('1.3. should revert when _rewardsAddress is the zero address', async () => {
            const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract")
            await expect(upgrades.deployProxy(UpgradeableBridgeContract, ['0x0000000000000000000000000000000000000000'])).to.be.reverted
        })
    })

    describe("2. Deploy", function () {

        it("2.1. Deploy contract", async function () {
            const [owner] = await ethers.getSigners()
            const tutorialToken = await deployContract(owner, TutorialTokenArtifact, [1000])

            const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract", owner)
            const bridge = await upgrades.deployProxy(UpgradeableBridgeContract, [tutorialToken.address])

            await bridge.deployed()
            expect(await bridge.token()).to.equal(tutorialToken.address)
        })

        it("2.2. Upgrade contract", async function () {
            const [owner] = await ethers.getSigners()
            const tutorialToken = await deployContract(owner, TutorialTokenArtifact, [1000])

            const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract")
            const UpgradeableBridgeContractTest = await ethers.getContractFactory("UpgradeableBridgeContractTest")

            const instance = await upgrades.deployProxy(UpgradeableBridgeContract, [tutorialToken.address])
            const upgraded = await upgrades.upgradeProxy(instance.address, UpgradeableBridgeContractTest)

            const value = await upgraded.token()
            expect(value.toString()).to.equal(tutorialToken.address)

            const get = await upgraded.get()
            expect(get.toNumber()).to.equal(5)

            expect(instance.address).to.be.equal(upgraded.address)
        })
    })

    describe('3. After deployment', () => {

        let bridgeContract: UpgradeableBridgeContract
        let tutorialToken: TutorialToken

        beforeEach(async () => {
            const [owner, relayer, account1, tokenWallet] = await ethers.getSigners()

            tutorialToken = await deployContract(tokenWallet, TutorialTokenArtifact, [1000]) as TutorialToken

            const UpgradeableBridgeContract = await ethers.getContractFactory("UpgradeableBridgeContract", owner)
            bridgeContract = await upgrades.deployProxy(UpgradeableBridgeContract, [tutorialToken.address]) as UpgradeableBridgeContract
            await bridgeContract.deployed()

            await tutorialToken.connect(tokenWallet).transfer(owner.address, 100)
            await tutorialToken.connect(tokenWallet).transfer(account1.address, 100)

            await tutorialToken.connect(owner).approve(bridgeContract.address, 100)
            await tutorialToken.connect(account1).approve(bridgeContract.address, 100)

            await bridgeContract.changeRelayerAddress(relayerAddress)
            expect(owner.address).to.be.equal(signatureOwner)
        })

        it('3.1. should set the right owner', async () => {
            const [owner] = await ethers.getSigners()
            expect(await bridgeContract.owner()).to.be.equal(owner.address)
        })

        it('3.2. should set the token correctly', async () => {
            expect(await bridgeContract.token()).to.equal(tutorialToken.address)
        })

        it('3.3. should set the relayer address correctly', async () => {
            const [owner, relayer] = await ethers.getSigners()
            await bridgeContract.changeRelayerAddress(relayer.address)
            expect(await bridgeContract.getRelayerAddress()).to.equal(relayer.address)
        })

        it('3.4. should revert', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()
            const msg = "Ownable: caller is not the owner"
            await expect(bridgeContract.connect(account1).changeRelayerAddress(relayer.address)).to.be.revertedWith(msg)
        })

        it('3.5. check current nonce', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()
            const nonce = await bridgeContract.getCurrentNonce(account1.address)
            await expect(nonce.toNumber()).to.equal(0)
        })

        it('3.6. should revert if lock 0', async () => {
            const msg = "The amount must be large than 0"
            await expect(bridgeContract.lock(0)).to.be.revertedWith(msg)
        })

        it('3.7. transfer amount should exceeds balance', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()
            const msg = "ERC20: transfer amount exceeds balance"
            await expect(bridgeContract.connect(relayer).lock(10)).to.be.revertedWith(msg)
        })

        it('3.8. should emit TokensLocked event', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()
            await expect(bridgeContract.connect(account1).lock(10)).to.emit(bridgeContract, 'TokensLocked').withArgs(account1.address, 10)
        })

        it('3.9. invalid nonce', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()
            const msg = "Invalid nonce"
            await expect(bridgeContract.connect(account1).lock(10)).to.emit(bridgeContract, 'TokensLocked').withArgs(account1.address, 10)
            await expect(bridgeContract.checkSignatureAndUnlock(account1.address, 1, 10, signature)).to.be.revertedWith(msg)
        })

        it('3.10. invalid signature length', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()
            const msg = "invalid signature length"
            await expect(bridgeContract.connect(account1).lock(10)).to.emit(bridgeContract, 'TokensLocked').withArgs(account1.address, 10)
            await expect(bridgeContract.checkSignatureAndUnlock(account1.address, 10, 1, '0x11111111')).to.be.revertedWith(msg)
        })

        it('3.11. invalid signature v value', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()

            await expect(bridgeContract.connect(account1).lock(10)).to.emit(bridgeContract, 'TokensLocked').withArgs(account1.address, 10)

            const msg = "invalid signature 'v' value"
            await expect(bridgeContract.checkSignatureAndUnlock(account1.address, 10, 1, '0x1111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111111')).to.be.revertedWith(msg)
        })

        it('3.12. invalid owner', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()

            await expect(bridgeContract.connect(account1).lock(10)).to.emit(bridgeContract, 'TokensLocked').withArgs(account1.address, 10)

            const msg = "Invalid owner"
            await expect(bridgeContract.checkSignatureAndUnlock(account1.address, 10, 1, signature)).to.be.revertedWith(msg)
        })

        it('3.13. should emit TokensUnlocked event', async () => {
            const [owner] = await ethers.getSigners()

            await expect(bridgeContract.connect(owner).lock(30)).to.emit(bridgeContract, 'TokensLocked').withArgs(owner.address, 30)
            await expect(bridgeContract.checkSignatureAndUnlock(signatureOwner, 30, 1, signature)).to.emit(bridgeContract, 'TokensUnlocked').withArgs(signatureOwner, 30)
        })

        it('3.14. nonce should increase', async () => {
            const [owner] = await ethers.getSigners()

            const nonce = await bridgeContract.getCurrentNonce(signatureOwner)

            await expect(bridgeContract.connect(owner).lock(30)).to.emit(bridgeContract, 'TokensLocked').withArgs(owner.address, 30)
            await expect(bridgeContract.checkSignatureAndUnlock(signatureOwner, 30, 1, signature)).to.emit(bridgeContract, 'TokensUnlocked').withArgs(signatureOwner, 30)

            const val = await bridgeContract.getCurrentNonce(signatureOwner)
            expect(val.toNumber()).to.be.equal(nonce.toNumber() + 1)
        })

        it('3.15. lock after lock', async () => {
            const [owner, relayer, account1] = await ethers.getSigners()

            await expect(bridgeContract.connect(account1).lock(30)).to.emit(bridgeContract, 'TokensLocked').withArgs(account1.address, 30)
            await expect(bridgeContract.connect(account1).lock(5)).to.be.revertedWith("A certain amount is already locked")
        })

        it('3.15. repeat unlock', async () => {
            const [owner] = await ethers.getSigners()

            await expect(bridgeContract.connect(owner).lock(30)).to.emit(bridgeContract, 'TokensLocked').withArgs(owner.address, 30)

            await expect(bridgeContract.checkSignatureAndUnlock(signatureOwner, 30, 1, signature)).to.emit(bridgeContract, 'TokensUnlocked').withArgs(signatureOwner, 30)
            await expect(bridgeContract.checkSignatureAndUnlock(signatureOwner, 30, 1, signature)).to.be.revertedWith("No amount is locked")
        })
    })
})