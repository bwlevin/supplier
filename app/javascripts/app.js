// Import the page's CSS. Webpack will know what to do with it.
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;

window.App = {
  start: function() {
    var self = this;

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[1];

      self.refreshBalance();
      self.getCost();
      self.getPossession();
      self.getSerial();
      self.getQuality();
      self.setState();
    });
  },

  setState: function() {
    var self = this;
    var state = "AWAITING COST"

    var meta;
    MetaCoin.deployed().then(function(instance){
      meta=instance;
      return meta.getApproval.call();
    }).then(function(value){
      if (value == true) {
        state = "COST APPROVED. AWAITING SHIPMENT";
      }
      else if ((parseInt(document.getElementById("current_cost").innerHTML) > 0)) {
        state = "AWAITING COST APPROVAL";
      }
      document.getElementById("state").innerHTML = state;
      return meta.getShipped.call();
    }).then(function (val) {
      if (val == true) {
        state = "PART SHIPPED. AWAITING DATA APPROVAL";
      }
      document.getElementById("state").innerHTML = state;
      return meta.getDataApproval.call();
    }).then(function(value){
      if (value == true) {
        state = "DATA APPROVED. AWAITING DELIVERY ACCEPTANCE";
      }
      document.getElementById("state").innerHTML = state;
      return meta.getDelivered.call();
    }).then(function (value) {
      if (value == true) {
        state = "DELIVERY COMPLETE. FUNDS TRANSFERRED";
      }
      document.getElementById("state").innerHTML = state;
    }).catch(function (e) {
      console.log(e);
      self.setStatus("Error setting state; see log");
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  refreshBalance: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getApproval.call();
    }).then(function(value) {
      if(value == true) {
        document.getElementById("approved").removeAttribute("hidden");
      }
      return meta.getShipped.call();
    }).then(function(value) {
      if(value == true) {
        document.getElementById("shipped").removeAttribute("hidden");
      }
      return meta.getDataApproval.call();
    }).then(function(value){
      if(value == true) {
        document.getElementById("data_approved").removeAttribute("hidden");
      }
      return meta.getBalance.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  getSerial: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getSerial.call({from:account});
    }).then(function(value) {
      var serial_no = document.getElementById("serial");
      serial_no.value = value.valueOf();
    }).catch(function(e) {
      alert("Unable to perform action.");
      console.log(e);
      self.setStatus("Error fetching serial number. See log.");
    });
  },

  setSerial: function(value) {
    var self = this;
    var new_serial = parseInt(document.getElementById("serial_no").value);

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.updateSerial(new_serial, {from: account});
    }).then(function () {
      self.setStatus("Serial number set!");
      document.getElementById("serial_no").value = "";
      window.location.reload();
    }).catch(function (e) {
      console.log(e);
      if (alert("Error setting serial number; see log.")) {}
      else window.location.reload();
    });
  },

  setQuality: function(value) {
    var self = this;
    var new_quality = parseInt(document.getElementById("new_quality").value);

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.updateQuality(new_quality, {from: account});
    }).then(function () {
      self.setStatus("Quality value set!");
      document.getElementById("new_quality").value="";
      window.location.reload();
    }).catch(function (e) {
      if(alert("Error setting quality; see log.")){}
      else window.location.reload();
      console.log(e);
    });
  },


  getPossession: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getPossession.call();
    }).then(function(value) {
      var possession = document.getElementById("current_owner");
      possession.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error fetching current owner. See log.");
    });
  },

  getQuality: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getQuality.call({from:account});
    }).then(function(value) {
      var serial_no = document.getElementById("quality");
      serial_no.value = value.valueOf();
    }).catch(function(e) {
      alert("Unable to perform action.");
      console.log(e);
      self.setStatus("Error fetching quality value. See log.");
    });
  },

  getCost: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.getCost.call();
    }).then(function(value) {
      var current_cost = document.getElementById("current_cost");
      current_cost.innerHTML = value.valueOf();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error fetching cost. See log.");
    });
  },

  setCost: function (cost) {
    var self = this;
    var new_cost = parseInt(document.getElementById("cost").value);

    var meta;
    MetaCoin.deployed().then(function (instance) {
      meta = instance;
      return meta.setCost(new_cost, {from: account});
    }).then(function() {
      self.setStatus("Price set. Awaiting approval.");
      self.getCost();
      window.location.reload();
    }).catch(function (e) {
      console.log(e);
      if (alert("Error setting cost; see log")){}
      else window.location.reload();
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  },

  addFunds: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.addFunds(amount, {from: account});
    }).then(function() {
      self.setStatus("Funds added!");
      self.refreshBalance();
      document.getElementById("amount").value="";
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error adding funds; see log.");
    });
  },

  approvePrice: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function (instance) {
      meta = instance;
      return meta.approvePrice({from: account});
    }).then(function() {
      self.setStatus("Price approved. Supplier can initiate shipment.");
      window.location.reload();
    }).catch(function (e) {
      console.log(e);
      alert("Unable to perform action.");
      self.setStatus("Error approving price; see log.");
    });
  },

  shipPart: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance){
      meta=instance;
      return meta.shipPart({from:account});
    }).then(function() {
      self.setStatus("Part shipped. Awaiting delivery.");
      window.location.reload();
    }).catch(function(e){
      console.log(e);
      alert("Unable to perform action");
      self.setStatus("Error shipping part; see log.");
    });
  },

  approveData: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta=instance;
      return meta.approveData({from:account});
    }).then(function(){
      self.setStatus("Part data confirmed. Please accept delivery of part now.");
      document.getElementById("data_approved").removeAttribute("hidden");
    }).catch(function(e){
      console.log(e);
      if(alert("Unable to approve data; see log.")){}
      else window.location.reload();
    })
  },

  takeDelivery: function() {
    var self = this;

    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating delivery and funds transfer...(please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.takeDelivery(receiver, "Airline Corp.", {from: account});
    }).then(function() {
      self.setStatus("Part Delivered. Funds Transferred.");
      self.refreshBalance();
      self.getPossession();
    }).catch(function(e) {
      console.log(e);
      if(alert("Error taking delivery. See log. Ensure sufficient funds have been added and try again.")){}
      else window.location.reload();
    });
  }
};

window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});
