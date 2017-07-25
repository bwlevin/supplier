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
	bool delivered;
	bool price_approved;
	bool data_approved;
	bool shipped;

	event Transfer(address indexed _from, address indexed _to, uint256 _value);
	event Delivery(string _old, string _new, uint _time);
	function MetaCoin() {
		balances[tx.origin] = 0;
		serial_no = 0;
		quality = 0;
		possession = "";
		owner = tx.origin;
		cost = 0;
		delivered = false;
		shipped = false;
		price_approved = false;
		data_approved = false;
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
		if (price_approved == false || shipped == false || data_approved == false) throw;
		if (balances[msg.sender] < cost) throw;
		Delivery(possession, new_possess, now);
		possession = new_possess;
		paySupplier(receiver, cost);
		delivered = true;
		return true;
	}

	function getDelivered() returns(bool){
		return delivered;
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
		if (msg.sender == owner) {
			if (shipped == false) throw;
		}
		return serial_no;
	}

	function updateSerial(uint new_val) {
		if (price_approved == false) throw;
		serial_no = new_val;
		shipped = false;
		delivered = false;
		data_approved = false;
	}

	function getPossession() returns(string) {
		return possession;
	}

	function updatePossession(string new_possess) {
		possession = new_possess;
	}

	function getQuality() constant returns(uint) {
		if (msg.sender == owner) {
			if (shipped == false) throw;
		}
		return quality;
	}

	function updateQuality(uint new_qual) {
		if (price_approved == false) throw;
		quality = new_qual;
		shipped = false;
		delivered = false;
		data_approved = false;
	}

	function setCost(uint val) {
		if (msg.sender == owner) throw;
		cost = val;
		price_approved = false;
		shipped = false;
		data_approved = false;
		delivered = false;
		serial_no = 0;
		quality = 0;
		possession = "";
	}

	function getCost() returns(uint) {
		return cost;
	}

	function approvePrice() {
		if (msg.sender != owner) throw;
		if (cost == 0) throw;
		price_approved = true;
		possession = "Supplier Co.";
	}

	function getApproval() returns(bool){
		return price_approved;
	}

	function shipPart() {
		if (msg.sender == owner) throw;
		if (price_approved == false) throw;
		if (serial_no == 0 || quality == 0) throw;
		if (balances[owner] < cost) throw;
		shipped = true;
		possession = "Supplier Co. (In transit)";
	}

	function getShipped() returns(bool){
		return shipped;
	}

	function approveData() {
		if(msg.sender != owner) throw;
		if (price_approved == false || shipped == false) throw;
		data_approved = true;
	}

	function getDataApproval() returns(bool){
		return data_approved;
	}

	function reset() {
		balances[owner] = 0;
		balances[1] = 0;
		serial_no = 0;
		quality = 0;
		possession = "";
		cost = 0;
		delivered = false;
		shipped = false;
		price_approved = false;
		data_approved = false;
	}
}
