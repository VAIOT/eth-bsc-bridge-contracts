pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract UpgradeableBridgeContract is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    // EVENTS
    event TokensLocked(address indexed account, uint256 amount);
    event TokensUnlocked(address indexed account, uint256 amount);

    using SafeMathUpgradeable for uint256;
    using MathUpgradeable for uint256;
    using AddressUpgradeable for address;
    using ECDSAUpgradeable for bytes32;

    IERC20 private _token;

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
        _token = IERC20(token);
        __Ownable_init();
    }

    /**
     * @return the token being held.
     */
    function token()
    public 
    view 
    returns (IERC20) 
    {
        return _token;
    }

    function lock(uint256 amount) 
    public
    nonReentrant
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

    function checkSignatureAndUnlock(address owner, uint256 amount, uint256 nonce, bytes memory signature) 
    public 
    nonReentrant
    checkNonce(nonce, owner) 
    {
        bytes32 hash = keccak256(abi.encodePacked(amount, nonce, owner));
        bytes32 messageHash = hash.toEthSignedMessageHash();

        address signer = messageHash.recover(signature);

        require(signer == _relayerAddress, "Invalid owner");

        NonceState storage nonceState = _addressToNonce[owner];
        nonceState.nonce += 1;
        nonceState.isLock = false;

        _unlock(owner, amount);
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

    function _unlock(address account, uint256 tokensToUnlock) 
    private 
    {
        require(token().transfer(account, tokensToUnlock), 'Something went wrong during the token transfer');
        emit TokensUnlocked(account, tokensToUnlock);
    }
}
