var Web3 = require("web3");

function Connector(web3, address) {
    if (address && address.indexOf("#")==0) address = address.substring(1);
    if (!address || address.length<40)      address = "0xbb9bc244d798123fde783fcc1c72d3bb8c189413";
    this.testnet = address.indexOf("T")==0;
    if (this.testnet)                       address = address.substring(1);
    if (address.indexOf("0x")<0)            address = "0x"+address;
    this.web3 = web3;
    this.address = address;
    this.isMist = typeof web3 !== 'undefined';
    
    // pick up the global web3-object injected by mist.
    if(this.isMist)
      this.web3 = new Web3(web3.currentProvider);
    else
      this.web3 = new Web3(new Web3.providers.HttpProvider( this.testnet ?  "http://37.120.164.112:8555" : "http://37.120.164.112:8545"));
      
    // set the accounts to be used  
    this.accounts = this.isMist ? this.web3.eth.accounts : [];
    if (!this.accounts || this.accounts.length==0) this.accounts=[this.address];
   
      // define the dao-contract   
   var abi = [
     {name:'proposals', "type":"function","outputs":[
       {"type":"address","name":"recipient"},
       {"type":"uint256","name":"amount"},
       {"type":"string","name":"description"},
       {"type":"uint256","name":"votingDeadline"},
       {"type":"bool","name":"open"},
       {"type":"bool","name":"proposalPassed"},
       {"type":"bytes32","name":"proposalHash"},
       {"type":"uint256","name":"proposalDeposit"},
       {"type":"bool","name":"newCurator"},
       {"type":"uint256","name":"yea"},
       {"type":"uint256","name":"nay"},
       {"type":"address","name":"creator"}],"inputs":[{"type":"uint256","name":""}],"constant":true},
    {name:'totalSupply', "type":"function","outputs":[
       {"type":"uint256","name":""}],"inputs":[],"constant":true},
    {name:'minQuorumDivisor',"type":"function","outputs":[
       {"type":"uint256","name":""}],"inputs":[],"constant":true},
    {name:'actualBalance',"type":"function","outputs":[
       {"type":"uint256","name":""}],"inputs":[],"constant":true},
    {name:'rewardToken', "constant":true,"inputs":[{"name":"","type":"address"}],"outputs":[
       {"name":"","type":"uint256"}],"type":"function"},       
    {name:"vote", "type":"function","outputs":[
       {"type":"uint256","name":"_voteID"}],"inputs":[
       {"type":"uint256","name":"_proposalID"}, 
       {"type":"bool","name":"_supportsProposal"}],"constant":false},
    {name:"numberOfProposals","type":"function","outputs":[
      {"type":"uint256","name":"_numberOfProposals"}],"inputs":[],"constant":true},
    {name:"balanceOf", "type" : "function",  "constant" : true, "outputs" : [{
            "type" : "uint256",
            "name" : "balance"
         }],"inputs" : [{
            "type" : "address",
            "name" : "_owner"
         }
      ]
   },
   ];
   this.contract = this.web3.eth.contract(abi).at(address);
}

Connector.prototype.loadProposal = function(idx, cb) {
   if (this.isMist || !this.proposals)
      this.contract.proposals(idx, cb);
   else
      cb(null,this.proposals[idx-1]);
};

Connector.prototype.getTxData =function(idx, cb) {
    if (this.tx && this.tx[idx-1]) cb(this.tx[idx-1]);
}
Connector.prototype.getStats = function($http, cb) {
  
   if (this.stats) return this.stats;
   var stats = this.stats = {}, web3 = this.web3, contract = this.contract, address=this.address, _=this;
   
   if ($http) {
      $http({  
          method: 'POST',  url: 'https://vote.daohub.org/proposals.json'
      }).then(function (response) {
          _.proposals = response.data.proposals;
          _.tx   = response.data.tx;
          cb(null, _.stats = response.data.stats); 
     }, function errorCallback(response) {
          cb('No Cache created yet!');
     });
     return;
   }
   
   
   // read the total number of tokens   
   contract.totalSupply(function(err,d){
       stats.total=web3.fromWei(d,"ether").toNumber();
       contract.minQuorumDivisor(function(err,minq){
            stats.minQuorumDivisor =  minq.toNumber() || 5;
            contract.actualBalance(function(err,bal){
                stats.actualBalance = bal.toNumber();
                contract.rewardToken(address,function(err,r){
                    stats.rewardToken = r.toNumber();
                    contract.numberOfProposals(function(err,all){
                        stats.allProposals = web3.toBigNumber(all).toNumber();
                        cb(null, stats);
                    });
                });
            });
        });
   });
};

Connector.prototype.createCache = function(cb) {
    var _=this;
    this.getStats(null, function(err, stats){
        var result = { stats: stats, proposals : [] };
        function load(idx) {
            if (idx>=stats.allProposals) {
                cb(result);
                return;
            }
            _.loadProposal(idx+1,function(err,p){
               result.proposals.push(p);
               load(idx+1);
            });
        }
        load(0);
    });
}

module.exports = Connector; 
