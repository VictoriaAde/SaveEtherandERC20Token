// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;
import "./IERC20.sol";

contract SaveERC20orEther {
    address savingToken;
    address owner;

    mapping(address => uint256) savingsEther;
    mapping(address => uint256) savingsToken;

    event SavingSuccessful(address sender, uint256 amount);
    event WithdrawSuccessful(address receiver, uint256 amount);

    constructor(address _savingToken) {
        savingToken = _savingToken;
        owner = msg.sender;
    }

    function tokendeposit(uint256 _amount) external {
        require(msg.sender != address(0), "address zero detected");
        require(_amount > 0, "can't save zero value");
        require(IERC20(savingToken).balanceOf(msg.sender) >= _amount, "not enough token");

        require(IERC20(savingToken).transferFrom(msg.sender, address(this), _amount), "failed to transfer");

        savingsToken[msg.sender] += _amount;

        emit SavingSuccessful(msg.sender, _amount);

    }

    function etherdeposit() external payable {
        require(msg.sender != address(0), "wrong EOA");
        require(msg.value > 0, "can't save zero value");

        savingsEther[msg.sender] = savingsEther[msg.sender] + msg.value;
        emit SavingSuccessful(msg.sender, msg.value);
    }
    
    function tokenWithdraw(uint256 _amount) external {
        require(msg.sender != address(0), "address zero detected");
        require(_amount > 0, "can't withdraw zero value");

        uint256 _userSaving = savingsToken[msg.sender];

        require(_userSaving >= _amount, "insufficient funds");

        savingsToken[msg.sender] -= _amount;

        require(IERC20(savingToken).transfer(msg.sender, _amount), "failed to withdraw");

        emit WithdrawSuccessful(msg.sender, _amount);
    }

    function etherWithdraw() external {
        require(msg.sender != address(0), "wrong EOA");

        uint256 _userSavings = savingsEther[msg.sender];

        require(_userSavings > 0, "you don't have any savings");

        savingsEther[msg.sender] -= _userSavings;

        payable(msg.sender).transfer(_userSavings);
    }

    function etherUserBalance(address _user) external view returns (uint256) {
        return savingsEther[_user];
    }  

    function tokenUserBalance(address _user) external view returns (uint256) {
        return savingsToken[_user];
    }

    function tokenContractBalance() external view returns(uint256) {
        return IERC20(savingToken).balanceOf(address(this));
    }

    function etherContractBal() external view returns (uint256) {
        return address(this).balance;
    }

    function ownerWithdrawToken(uint256 _amount) external {
        onlyOwner();
        IERC20(savingToken).transfer(msg.sender, _amount);
    }   
    
    function ownerWithdrawEther(uint256 _amount) external {
        onlyOwner();
        payable(msg.sender).transfer(_amount);
    }

    function onlyOwner() private view{
        require(msg.sender == owner, "not owner");
    }
}

