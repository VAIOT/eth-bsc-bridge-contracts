pragma solidity ^0.6.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/Initializable.sol";

contract UpgradeableBridgeContract is Initializable, OwnableUpgradeable {

    // EVENTS
    event TokensLocked(address indexed account, uint256 amount);
    event TokensUnlocked(address indexed account, uint256 amount);

    using AddressUpgradeable for address;
    using ECDSAUpgradeable for bytes32;

    ERC20Upgradeable private _token;

    // STRUCT DECLARATIONS
    struct NonceState {
        uint256 nonce;
        bool isLock;
    }

    mapping(address => NonceState) private _addressToNonce;

    address private _relayerAddress;

    // MODIFIERS
    modifier onlyContract(address account) 
    {
        require(account.isContract(), "[Validation] The address does not contain a contract");
        _;
    }

    modifier checkNonce(uint256 nonce, address account) 
    {
        require(_addressToNonce[account].isLock == true, "No amount is locked");
        require(_addressToNonce[account].nonce == nonce - 1, "Invalid nonce");
        _;
    }

    modifier checkIfUnlock(address account) {
       require(_addressToNonce[account].isLock == false, "A certain amount is already locked");
        _;
    }

    // PUBLIC FUNCTIONS
    function initialize(address token) 
    public 
    initializer 
    onlyContract(token) 
    {
        _token = ERC20Upgradeable(token);
        __Ownable_init();
    }

    /**
     * @return the token being held.
     */
    function token()
    public 
    view 
    returns (ERC20Upgradeable) 
    {
        return _token;
    }

    function lock(uint256 amount) 
    public 
    checkIfUnlock(msg.sender)
    {
        require(amount > uint256(0), "The amount must be large than 0");

        require(
            token().transferFrom(msg.sender, address(this), amount),
            'Something went wrong during the token transfer'
        );
        _addressToNonce[msg.sender].isLock = true;
        emit TokensLocked(msg.sender, amount);
    }

    function unlock(address account, uint256 tokensToUnlock) 
    public 
    {
        require(token().transfer(account, tokensToUnlock), 'Something went wrong during the token transfer');
        emit TokensUnlocked(account, tokensToUnlock);
    }

    function checkSignatureAndUnlock(address owner, uint256 amount, uint256 nonce, bytes memory signature) 
    public 
    checkNonce(nonce, owner) 
    {
        bytes32 hash = keccak256(abi.encodePacked(amount, nonce, owner));
        bytes32 messageHash = hash.toEthSignedMessageHash();

        address signer = messageHash.recover(signature);

        require(signer == _relayerAddress, "Invalid owner");

        NonceState storage nonceState = _addressToNonce[owner];
        nonceState.nonce+= 1;
        nonceState.isLock = false;

        unlock(owner, amount);
    }

    function recover(bytes32 hash, bytes memory signature)
    public
    pure
    returns (address)
    {
        return hash.recover(signature);
    }

    function changeRelayerAddress(address relayerAddress) 
    public 
    onlyOwner 
    {
        _relayerAddress = relayerAddress;
    }

    function getRelayerAddress() 
    public 
    view 
    onlyOwner 
    returns(address) 
    {
        return _relayerAddress;
    }

    function getCurrentNonce(address account) 
    public 
    view 
    returns (uint256) 
    {
        return _addressToNonce[account].nonce;
    }
}
