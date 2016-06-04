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

function searchTransactions(startPage, handler, done) {
   function next(err, data, page) {
      if (err) console.log(err);
      else {
         data.result.forEach(handler);
         if (data.result.length>0)
            getTx(page+1, next);
         else
            done(page-1);
      }  
   }
   getTx(startPage, next);
}

function startTxSearch(data, cb) {
   var proposals = data.tx || [];
   searchTransactions( data.page || 80, tx => {
      if (tx.input.indexOf("0x612e45a3")==0 && tx.isError=="0"/* && !tx.gasUsed>=tx.gas*/) // new Proposal!
      {
         var res = coder.decodeParams(['address','uint','string','bytes','uint','bool'],tx.input.substring(10));
         var receipt = connector.web3.eth.getTransactionReceipt(tx.hash.substring(2));
         if (!receipt || !receipt.logs || !receipt.logs.length) return;
         var proposalId = parseInt(receipt.logs[0].topics[1]);
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
         (proposals[proposalId-1] || (proposals[proposalId-1]={votes:[]})).votes.push({
            address : tx.from,
            support : res[1],
            block   : tx.blockNumber,
            tx      : tx.hash,
            balance : connector.contract.balanceOf(tx.from, tx.blockNumber).toNumber()
         });
      }
    }, 
    (page)=>cb(proposals,page));
}


connector.createCache(function(result){
   
   var target = "dist/proposals.json";
   fs.readFile(target, {encoding:'UTF-8'}, (err,data) => {

      startTxSearch(err ? { tx:[], page:80 } : JSON.parse(data), (proposals,page) => {
         result.tx   = proposals;
         result.page = page;
         fs.writeFile(target,JSON.stringify(result));
         console.log("done");
      });
      
   });
   
   
});
