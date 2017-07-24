pragma solidity ^0.4.2;

import "./ConvertLib.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

contract MetaCoin {
	mapping (address => uint) balances;
	uint serial_no;
	uint quality;
	string possession;
	address public owner;
	uint cost;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Delivery(string _old, string _new, uint _time);
	function MetaCoin() {
		balances[tx.origin] = 0;
		serial_no = 0;
		quality = 0;
		possession = "";
		owner = tx.origin;
		cost = 0;
	}

	function sendCoin(address receiver, uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}

	function paySupplier(address receiver, uint amount) returns(bool sufficient) {
		if (balances[msg.sender] < amount) return false;
		if (msg.sender != owner) return false;
		balances[msg.sender] -= amount;
		balances[receiver] += amount;
		Transfer(msg.sender, receiver, amount);
		return true;
	}

	function takeDelivery(address receiver, string new_possess) returns(bool success) {
		Delivery(possession, new_possess, now);
		possession = new_possess;
		if (balances[msg.sender] < cost) return false;
		paySupplier(receiver, cost);
		return true;
	}

	function addFunds (uint amount) returns(bool success) {
		if (msg.sender != owner) return false;
		balances[msg.sender] += amount;
		return true;
	}

	function getBalanceInEth(address addr) returns(uint){
		return ConvertLib.convert(getBalance(addr),2);
	}

	function getBalance(address addr) returns(uint) {
		return balances[addr];
	}

	function getSerial() returns(uint) {
		return serial_no;
	}

	function updateSerial(uint new_val) {
		serial_no = new_val;
	}

	function getPossession() returns(string) {
		return possession;
	}

	function updatePossession(string new_possess) {
		possession = new_possess;
	}

	function getQuality() constant returns(uint) {
		return quality;
	}

	function updateQuality(uint new_qual) {
		quality = new_qual;
	}

	function setCost(uint val) {
		cost = val;
	}

	function getCost() returns(uint) {
		return cost;
	}
}
