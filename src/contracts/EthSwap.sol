pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    function buytokens() public payable{
        //Amount of Ethereum * Redemption rate
        //Redemption rate = # of token recieve for 1 ether
        //Calaculate the number of token to buy
        uint tokenAmount = msg.value * rate;

        //Require EthSwap SC has enough tokens for the transaction
        require(token.balanceOf(address(this)) >= tokenAmount);

        //Transfer tokens to the user
        token.transfer(msg.sender, tokenAmount);

        //Emit an event
        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }


    function selltokens(uint _amount) public {

        //User cant sell more token than they have
        require(token.balanceOf(msg.sender) >= _amount);

        //Calculate the amount of ether to redeem
        uint etherAmount = _amount/rate;

        //Require EthSwap SC has enough ether for the transaction
        require(address(this).balance >= etherAmount);

        //Perform sale
        token.transferFrom(msg.sender,address(this),_amount);
        //token.transfer(address(this),_amount);
        msg.sender.transfer(etherAmount);

        //Emit an event
        emit TokensSold(msg.sender, address(this), etherAmount, rate);
    }
}