var web3      = require("web3");
var https     = require('https');
var fs        = require("fs");
var Connector = require("./loader");
var coder     = require("web3/lib/solidity/coder");
var connector = new Connector( undefined, process.argv[2] || "" );

function getTx(page,cb) {
   console.log("read page "+ page);
   https.get('https://api.etherscan.io/api?module=account&action=txlist&address='+connector.address+'&sort=asc&page='+page+'&offset=1000', (res) => {
      var data = "";
      res.on('data', (d) => { data+=d; });
      res.on('end', ()=>{ cb(null,JSON.parse(data),page)});
   }).on('error', cb);
}

function searchTransactions(handlers, done) {
   function next(err, data, page) {
      if (err) console.log(err);
      else {
         handlers.forEach(h=> data.result.forEach(h));
         if (data.result.length>0)
            getTx(page+1, next);
         else
            done();
      }  
   }
   getTx(80, next);
}

function startTxSearch(cb) {
   var proposals = [];
   var handlers=[
      function (tx) {
         if (tx.input.indexOf("0x612e45a3")==0 && tx.isError=="0"/* && !tx.gasUsed>=tx.gas*/) // new Proposal!
         {
            var res = coder.decodeParams(['address','uint','string','bytes','uint','bool'],tx.input.substring(10));
            var logs = connector.web3.eth.getTransactionReceipt(tx.hash.substring(2)).logs;
            if (!logs || logs.length==0) return;
            var proposalId = parseInt(logs[0].topics[1]);
            console.log("proposal #"+proposalId+" : "+res[2]);
            proposals[proposalId-1]={
               recipient: res[0],
               amount : res[1],
               descr : res[2],
               data : res[3],
               debatPeriod: res[4],
               split: res[5],
               txHash : tx.hash,
               block :   tx.blockNumber,
               created : connector.web3.eth.getBlock(tx.blockNumber).timestamp,
               votes   : []
            };
         }
         if (tx.input.indexOf("0xc9d27afe")==0 && tx.isError=="0"/* && !tx.gasUsed>=tx.gas*/) // new Proposal!
         {
            var res = coder.decodeParams(['uint','bool'],tx.input.substring(10));
            var proposalId = res[0].toNumber();
            proposals[proposalId-1].votes.push({
               address : tx.from,
               support : res[1],
               block   : tx.blockNumber,
               tx      : tx.hash
            });
         }
      }
   ];
   searchTransactions( tx => {
      if (tx.input.indexOf("0x612e45a3")==0 && tx.isError=="0"/* && !tx.gasUsed>=tx.gas*/) // new Proposal!
      {
         var res = coder.decodeParams(['address','uint','string','bytes','uint','bool'],tx.input.substring(10));
         var logs = connector.web3.eth.getTransactionReceipt(tx.hash.substring(2)).logs;
         if (!logs || logs.length==0) return;
         var proposalId = parseInt(logs[0].topics[1]);
         console.log("proposal #"+proposalId+" : "+res[2]);
         proposals[proposalId-1]={
            recipient: res[0],
            amount : res[1],
            descr : res[2],
            data : res[3],
            debatPeriod: res[4],
            split: res[5],
            txHash : tx.hash,
            block :   tx.blockNumber,
            created : connector.web3.eth.getBlock(tx.blockNumber).timestamp,
            votes   : []
         };
      }
      if (tx.input.indexOf("0xc9d27afe")==0 && tx.isError=="0"/* && !tx.gasUsed>=tx.gas*/) // new Proposal!
      {
         var res = coder.decodeParams(['uint','bool'],tx.input.substring(10));
         var proposalId = res[0].toNumber();
         proposals[proposalId-1].votes.push({
            address : tx.from,
            support : res[1],
            block   : tx.blockNumber,
            tx      : tx.hash
         });
      }
    }, 
    ()=>cb(proposals));
}


connector.createCache(function(result){
   
   startTxSearch(function(proposals){
      result.tx = proposals;
      fs.writeFile("dist/proposals.json",JSON.stringify(result));
      console.log("done");
   });
   
});
