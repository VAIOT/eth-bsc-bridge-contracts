pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/MathUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/AddressUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/security/PausableUpgradeable.sol";

contract UpgradeableBridgeContractTest is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable, PausableUpgradeable {

    // EVENTS
    event TokensLocked(address indexed account, uint256 amount, uint256 nonce);
    event TokensUnlocked(address indexed account, uint256 amount, uint256 nonce);

    using SafeMathUpgradeable for uint256;
    using MathUpgradeable for uint256;
    using AddressUpgradeable for address;
    using ECDSAUpgradeable for bytes32;

    IERC20 private _token;

    // STRUCT DECLARATIONS
    struct NonceState {
        uint256 sendNonce;
        uint256 receiveNonce;
    }

    mapping(address => NonceState) private _addressToNonce;

    address private _relayerAddress;

    // MODIFIERS
    modifier onlyContract(address account) 
    {
        require(account.isContract(), "[Validation] The address does not contain a contract");
        _;
    }

    modifier checkSendNonce(uint256 nonce, address account) 
    {
        require(_addressToNonce[account].sendNonce == nonce - 1, "Invalid send nonce");
        _;
    }

    modifier checkReceiveNonce(uint256 nonce, address account) 
    {
        require(_addressToNonce[account].receiveNonce == nonce - 1, "Invalid receive nonce");
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
        __ReentrancyGuard_init();
        __Pausable_init();
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

    function lock(uint256 amount, uint256 nonce) 
    public
    nonReentrant
    whenNotPaused
    checkSendNonce(nonce, msg.sender)
    { 
        require(amount > uint256(0), "The amount must be large than 0");

        NonceState storage nonceState = _addressToNonce[msg.sender];
        nonceState.sendNonce += 1;

        require(
            token().transferFrom(msg.sender, address(this), amount),
            'Something went wrong during the token transfer'
        );

        emit TokensLocked(msg.sender, amount, nonce);
    }

    function checkSignatureAndUnlock(address owner, uint256 amount, uint256 nonce, bytes memory signature) 
    public 
    nonReentrant
    whenNotPaused
    checkReceiveNonce(nonce, owner)
    {
        bytes32 hash = keccak256(abi.encodePacked(amount, nonce, owner));
        bytes32 messageHash = hash.toEthSignedMessageHash();

        address signer = messageHash.recover(signature);

        require(signer == _relayerAddress, "Invalid owner");

        NonceState storage nonceState = _addressToNonce[owner];
        nonceState.receiveNonce += 1;

        _unlock(owner, amount, nonce);
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

    function getSendNonce(address account) 
    public 
    view 
    returns (uint256) 
    {
        return _addressToNonce[account].sendNonce;
    }

    function getReceiveNonce(address account) 
    public
    view 
    returns (uint256) 
    {
        return _addressToNonce[account].receiveNonce;
    }

    function _unlock(address account, uint256 tokensToUnlock, uint256 nonce) 
    private 
    {
        require(token().transfer(account, tokensToUnlock), 'Something went wrong during the token transfer');
        emit TokensUnlocked(account, tokensToUnlock, nonce);
    }

    function get() public pure returns (uint256) {
        return 5;
    }

    function pause() public  whenNotPaused{
      _pause();
    }
}
