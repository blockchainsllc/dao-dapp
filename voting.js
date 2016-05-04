if(typeof web3 !== 'undefined')
  web3 = new Web3(web3.currentProvider);
else
  web3 = new Web3(new Web3.providers.HttpProvider("http://37.120.164.112:8555"));
function sha3Int(p) {
  return web3.toBigNumber("0x"+web3.sha3(p.toString(16), {encoding: 'hex'})).toNumber();
}

(function(){

   // define the module
   angular
   .module('daovoting', [ 'ngMaterial', 'ngAnimate','ngMessages' ,'ui.identicon'])
   .controller('DaoVotingCtrl', [ '$scope', '$mdBottomSheet', '$mdDialog','$log', '$q', '$http','$timeout', DaoVotingCtrl ])
   .config(function($mdThemingProvider){
      $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('red');
   }) ;

   
   var address = "0xbb9bc244d798123fde783fcc1c72d3bb8c189413";
   address  ="0xad23d7c443382333543dd13c3b77b99b2a7e2c6d";
   var abi = [{"type":"function","outputs":[{"type":"address","name":"recipient"},{"type":"uint256","name":"amount"},{"type":"string","name":"description"},{"type":"uint256","name":"votingDeadline"},{"type":"bool","name":"open"},{"type":"bool","name":"proposalPassed"},{"type":"bytes32","name":"proposalHash"},{"type":"uint256","name":"proposalDeposit"},{"type":"bool","name":"newCurator"},{"type":"uint256","name":"yea"},{"type":"uint256","name":"nay"},{"type":"address","name":"creator"}],"name":"proposals","inputs":[{"type":"uint256","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"approve","inputs":[{"type":"address","name":"_spender"},{"type":"uint256","name":"_amount"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"minTokensToCreate","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"rewardAccount","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"daoCreator","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"totalSupply","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":"divisor"}],"name":"divisor","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"extraBalance","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":"_newDAO"}],"name":"getNewDAOAdress","inputs":[{"type":"uint256","name":"_proposalID"}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"executeProposal","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"bytes","name":"_transactionData"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transferFrom","inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"totalRewardToken","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":"_actualBalance"}],"name":"actualBalance","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"closingTime","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"allowedRecipients","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transferWithoutReward","inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[],"name":"refund","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"_proposalID"}],"name":"newProposal","inputs":[{"type":"address","name":"_recipient"},{"type":"uint256","name":"_amount"},{"type":"string","name":"_description"},{"type":"bytes","name":"_transactionData"},{"type":"uint256","name":"_debatingPeriod"},{"type":"bool","name":"_newCurator"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"DAOpaidOut","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"minQuorumDivisor","inputs":[],"constant":true},{"type":"function","outputs":[],"name":"newContract","inputs":[{"type":"address","name":"_newContract"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"balance"}],"name":"balanceOf","inputs":[{"type":"address","name":"_owner"}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"changeAllowedRecipients","inputs":[{"type":"address","name":"_recipient"},{"type":"bool","name":"_allowed"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"halveMinQuorum","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"paidOut","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"splitDAO","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"address","name":"_newCurator"}],"constant":false},{"type":"function","outputs":[{"type":"address","name":""}],"name":"DAOrewardAccount","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"proposalDeposit","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":"_numberOfProposals"}],"name":"numberOfProposals","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"lastTimeMinQuorumMet","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"retrieveDAOReward","inputs":[{"type":"bool","name":"_toMembers"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"receiveEther","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transfer","inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"isFueled","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"createTokenProxy","inputs":[{"type":"address","name":"_tokenHolder"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"_voteID"}],"name":"vote","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"bool","name":"_supportsProposal"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"getMyReward","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"rewardToken","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transferFromWithoutReward","inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"remaining"}],"name":"allowance","inputs":[{"type":"address","name":"_owner"},{"type":"address","name":"_spender"}],"constant":true},{"type":"function","outputs":[],"name":"changeProposalDeposit","inputs":[{"type":"uint256","name":"_proposalDeposit"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"blocked","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"curator","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_codeChecksOut"}],"name":"checkProposalCode","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"address","name":"_recipient"},{"type":"uint256","name":"_amount"},{"type":"bytes","name":"_transactionData"}],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"privateCreation","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"isBlocked","inputs":[{"type":"address","name":"_account"}],"constant":false},{"type":"constructor","inputs":[{"type":"address","name":"_curator"},{"type":"address","name":"_daoCreator"},{"type":"uint256","name":"_proposalDeposit"},{"type":"uint256","name":"_minTokensToCreate"},{"type":"uint256","name":"_closingTime"},{"type":"address","name":"_privateCreation"}]},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"_from","indexed":true},{"type":"address","name":"_to","indexed":true},{"type":"uint256","name":"_amount","indexed":false}],"anonymous":false},{"type":"event","name":"Approval","inputs":[{"type":"address","name":"_owner","indexed":true},{"type":"address","name":"_spender","indexed":true},{"type":"uint256","name":"_amount","indexed":false}],"anonymous":false},{"type":"event","name":"FuelingToDate","inputs":[{"type":"uint256","name":"value","indexed":false}],"anonymous":false},{"type":"event","name":"CreatedToken","inputs":[{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"amount","indexed":false}],"anonymous":false},{"type":"event","name":"Refund","inputs":[{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"value","indexed":false}],"anonymous":false},{"type":"event","name":"ProposalAdded","inputs":[{"type":"uint256","name":"proposalID","indexed":true},{"type":"address","name":"recipient","indexed":false},{"type":"uint256","name":"amount","indexed":false},{"type":"bool","name":"newCurator","indexed":false},{"type":"string","name":"description","indexed":false}],"anonymous":false},{"type":"event","name":"Voted","inputs":[{"type":"uint256","name":"proposalID","indexed":true},{"type":"bool","name":"position","indexed":false},{"type":"address","name":"voter","indexed":true}],"anonymous":false},{"type":"event","name":"ProposalTallied","inputs":[{"type":"uint256","name":"proposalID","indexed":true},{"type":"bool","name":"result","indexed":false},{"type":"uint256","name":"quorum","indexed":false}],"anonymous":false},{"type":"event","name":"NewCurator","inputs":[{"type":"address","name":"_newCurator","indexed":true}],"anonymous":false},{"type":"event","name":"AllowedRecipientChanged","inputs":[{"type":"address","name":"_recipient","indexed":true},{"type":"bool","name":"_allowed","indexed":false}],"anonymous":false}];

   var contract = web3.eth.contract(abi).at(address);
   
   

// define main-controller
function DaoVotingCtrl( $scope, $mdBottomSheet, $mdDialog,  $log, $q, $http,$timeout) {
   
   $scope.proposals = [];
   $scope.showProposal = function(p,ev) {
      $scope.currentProposal=p;
   }
   
   function loadProposal(idx,cb) {
      contract.proposals(idx,function(err,proposal){
         var p = { 
            recipient      : proposal[0],
            amount         : web3.fromWei(proposal[1],"ether").toNumber(),
            description    : proposal[2],
            votingDeadline : new Date(proposal[3].toNumber() * 1000),
            open           : proposal[4],
            proposalPassed : proposal[5],
            proposalHash   : proposal[6],
            proposalDeposit: web3.fromWei(proposal[7],"ether").toNumber(),
            newCurator     : proposal[8],
            yea            : proposal[9].toNumber(),
            nay            : proposal[10].toNumber(),
            creator        : proposal[11]
         };
         p.active = p.votingDeadline.getTime() > new Date().getTime() && p.open;
         cb(p);
      });
   }
   
   contract.numberOfProposals(function(err,d){
      var all = web3.toBigNumber(d).toNumber();
      
      function nextProposal() {
         if (all==0) return; 
         loadProposal(all-1, function(p){
            all--;
            $scope.proposals.push(p);
            $scope.$apply();
            nextProposal();
         }); 
      }
      
      nextProposal();
      
   });
   
   

   
   
   
   
   
   
   
   
   $scope.pos=0;
   $scope.val={};
   $scope.update = function(src) {
      if (src==1) {
         var s = $scope.pos.toString(16);
         while (s.length<64) s="0"+s;
         $scope.hexpos="0x"+s;
      }
      else if (src==2) 
          $scope.pos = web3.toBigNumber($scope.hexpos).toNumber();
      $scope.val.value = web3.eth.getStorageAt(address,$scope.hexpos);
      $scope.val.int = web3.toBigNumber($scope.val.value).toNumber();
      $scope.val.date = new Date($scope.val.int*1000).toUTCString();
      $scope.val.sha3Int = sha3Int($scope.pos);
      $scope.val.sha3 = "0x"+web3.sha3( $scope.hexpos.substring(2) , {encoding: 'hex'});
   }
}  

})(); 
   
   
   
   
   