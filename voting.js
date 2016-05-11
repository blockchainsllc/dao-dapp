(function(){

   // define the module
   angular
   .module('daovoting', [ 'ngMaterial', 'ngAnimate','ngMessages' ,'ui.identicon','ngSanitize'])
   // main controller
   .controller('DaoVotingCtrl', [ '$scope', '$mdBottomSheet', '$mdDialog','$log', '$q', '$http','$timeout', DaoVotingCtrl ])
   // collapse directive creating a nice accordian-effect when selecting
   .directive('collapse', [function () {
		return {
			restrict: 'A',
			link: function ($scope, ngElement, attributes) {
				var element = ngElement[0];
				$scope.$watch(attributes.collapse, function (collapse) {
        
          if (!collapse)  element.style.display = 'block';

					var newHeight = collapse ? 2 : getElementAutoHeight();
					element.style.height = newHeight + 'px';
          element.style.opacity = collapse ? 0 : 1;
          element.style.transform = "scaleY("+(collapse ? 2.1 : 1)+")";
          element.style.pointerEvents= collapse ? 'none': 'auto';
					ngElement.toggleClass('collapsed', collapse);
				});

				function getElementAutoHeight() {
					var currentHeight = getElementCurrentHeight();
					element.style.height = 'auto';
					var autoHeight = getElementCurrentHeight();
					element.style.height = currentHeight;
					getElementCurrentHeight(); // Force the browser to recalc height after moving it back to normal
					return autoHeight;
				}

				function getElementCurrentHeight() {
					return element.offsetHeight
				}
			}
		};
	}])
   // config theme
   .config(function($mdThemingProvider){
      $mdThemingProvider.theme('default')
      .primaryPalette('blue-grey')
      .accentPalette('red');
   }) ;

   
   // pick up the global web3-object injected by mist.
   if(typeof web3 !== 'undefined')
      web3 = new Web3(web3.currentProvider);
   else
      web3 = new Web3(new Web3.providers.HttpProvider("http://37.120.164.112:8555"));


   
   
   var address = "0xbb9bc244d798123fde783fcc1c72d3bb8c189413";
   address  ="0xad23d7c443382333543dd13c3b77b99b2a7e2c6d";
   
   var abi = [{"type":"function","outputs":[{"type":"address","name":"recipient"},{"type":"uint256","name":"amount"},{"type":"string","name":"description"},{"type":"uint256","name":"votingDeadline"},{"type":"bool","name":"open"},{"type":"bool","name":"proposalPassed"},{"type":"bytes32","name":"proposalHash"},{"type":"uint256","name":"proposalDeposit"},{"type":"bool","name":"newCurator"},{"type":"uint256","name":"yea"},{"type":"uint256","name":"nay"},{"type":"address","name":"creator"}],"name":"proposals","inputs":[{"type":"uint256","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"approve","inputs":[{"type":"address","name":"_spender"},{"type":"uint256","name":"_amount"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"minTokensToCreate","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"rewardAccount","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"daoCreator","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"totalSupply","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":"divisor"}],"name":"divisor","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"extraBalance","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"address","name":"_newDAO"}],"name":"getNewDAOAdress","inputs":[{"type":"uint256","name":"_proposalID"}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"executeProposal","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"bytes","name":"_transactionData"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transferFrom","inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"totalRewardToken","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":"_actualBalance"}],"name":"actualBalance","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"closingTime","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"allowedRecipients","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transferWithoutReward","inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[],"name":"refund","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"_proposalID"}],"name":"newProposal","inputs":[{"type":"address","name":"_recipient"},{"type":"uint256","name":"_amount"},{"type":"string","name":"_description"},{"type":"bytes","name":"_transactionData"},{"type":"uint256","name":"_debatingPeriod"},{"type":"bool","name":"_newCurator"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"DAOpaidOut","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"minQuorumDivisor","inputs":[],"constant":true},{"type":"function","outputs":[],"name":"newContract","inputs":[{"type":"address","name":"_newContract"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"balance"}],"name":"balanceOf","inputs":[{"type":"address","name":"_owner"}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"changeAllowedRecipients","inputs":[{"type":"address","name":"_recipient"},{"type":"bool","name":"_allowed"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"halveMinQuorum","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"paidOut","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"splitDAO","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"address","name":"_newCurator"}],"constant":false},{"type":"function","outputs":[{"type":"address","name":""}],"name":"DAOrewardAccount","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"proposalDeposit","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":"_numberOfProposals"}],"name":"numberOfProposals","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"lastTimeMinQuorumMet","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"retrieveDAOReward","inputs":[{"type":"bool","name":"_toMembers"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"receiveEther","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transfer","inputs":[{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"isFueled","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"createTokenProxy","inputs":[{"type":"address","name":"_tokenHolder"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"_voteID"}],"name":"vote","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"bool","name":"_supportsProposal"}],"constant":false},{"type":"function","outputs":[{"type":"bool","name":"_success"}],"name":"getMyReward","inputs":[],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"rewardToken","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"success"}],"name":"transferFromWithoutReward","inputs":[{"type":"address","name":"_from"},{"type":"address","name":"_to"},{"type":"uint256","name":"_value"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":"remaining"}],"name":"allowance","inputs":[{"type":"address","name":"_owner"},{"type":"address","name":"_spender"}],"constant":true},{"type":"function","outputs":[],"name":"changeProposalDeposit","inputs":[{"type":"uint256","name":"_proposalDeposit"}],"constant":false},{"type":"function","outputs":[{"type":"uint256","name":""}],"name":"blocked","inputs":[{"type":"address","name":""}],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"curator","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":"_codeChecksOut"}],"name":"checkProposalCode","inputs":[{"type":"uint256","name":"_proposalID"},{"type":"address","name":"_recipient"},{"type":"uint256","name":"_amount"},{"type":"bytes","name":"_transactionData"}],"constant":true},{"type":"function","outputs":[{"type":"address","name":""}],"name":"privateCreation","inputs":[],"constant":true},{"type":"function","outputs":[{"type":"bool","name":""}],"name":"isBlocked","inputs":[{"type":"address","name":"_account"}],"constant":false},{"type":"constructor","inputs":[{"type":"address","name":"_curator"},{"type":"address","name":"_daoCreator"},{"type":"uint256","name":"_proposalDeposit"},{"type":"uint256","name":"_minTokensToCreate"},{"type":"uint256","name":"_closingTime"},{"type":"address","name":"_privateCreation"}]},{"type":"event","name":"Transfer","inputs":[{"type":"address","name":"_from","indexed":true},{"type":"address","name":"_to","indexed":true},{"type":"uint256","name":"_amount","indexed":false}],"anonymous":false},{"type":"event","name":"Approval","inputs":[{"type":"address","name":"_owner","indexed":true},{"type":"address","name":"_spender","indexed":true},{"type":"uint256","name":"_amount","indexed":false}],"anonymous":false},{"type":"event","name":"FuelingToDate","inputs":[{"type":"uint256","name":"value","indexed":false}],"anonymous":false},{"type":"event","name":"CreatedToken","inputs":[{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"amount","indexed":false}],"anonymous":false},{"type":"event","name":"Refund","inputs":[{"type":"address","name":"to","indexed":true},{"type":"uint256","name":"value","indexed":false}],"anonymous":false},{"type":"event","name":"ProposalAdded","inputs":[{"type":"uint256","name":"proposalID","indexed":true},{"type":"address","name":"recipient","indexed":false},{"type":"uint256","name":"amount","indexed":false},{"type":"bool","name":"newCurator","indexed":false},{"type":"string","name":"description","indexed":false}],"anonymous":false},{"type":"event","name":"Voted","inputs":[{"type":"uint256","name":"proposalID","indexed":true},{"type":"bool","name":"position","indexed":false},{"type":"address","name":"voter","indexed":true}],"anonymous":false},{"type":"event","name":"ProposalTallied","inputs":[{"type":"uint256","name":"proposalID","indexed":true},{"type":"bool","name":"result","indexed":false},{"type":"uint256","name":"quorum","indexed":false}],"anonymous":false},{"type":"event","name":"NewCurator","inputs":[{"type":"address","name":"_newCurator","indexed":true}],"anonymous":false},{"type":"event","name":"AllowedRecipientChanged","inputs":[{"type":"address","name":"_recipient","indexed":true},{"type":"bool","name":"_allowed","indexed":false}],"anonymous":false}];

   var contract = web3.eth.contract(abi).at(address);
   
function buildData(proposal, supports) {
    return contract.vote.getData(proposal, supports);
}





// define main-controller
function DaoVotingCtrl( $scope, $mdBottomSheet, $mdDialog,  $log, $q, $http,$timeout) {
   
   $scope.from = address;                         // address of the user to send the transaction from.
   $scope.filter = { active:true, split: false};  // filter the proposal list 
   $scope.total=1;                                // number of Propsals existing
   $scope.proposals = [];                         // loaded Proposals
   
   $scope.showProposal = function(p,ev) {         // called, when selecting a proposal 
      $scope.currentProposal=p;
      
      if (!p.gasNeeded) {
        // we need to check, if the user already voted. We do this, by calling the vote-function without a transaction and checking if all the gas is used, which means
        // a error was thrown ans so the user is not allowed to vote.
        var gas = 0x999999;
        web3.eth.estimateGas({ to: address, data: buildData(p.id,true), from: $scope.from, gas: gas, }, function(err,data) {
           // only if the estimated gas is lower then the given we knwo it would be succesful, otherwise all the gas is used, because a exception is thrown.
           p.enabled   = data < gas;
           p.gasNeeded = data;
           $scope.$apply();
        });
      }
   };
   
   $scope.sendVotingTransaction = function(ev, accept) {
     web3.eth.sendTransaction({
         to  : address, 
         data: buildData($scope.currentProposal.id,accept), 
         from: $scope.from, 
         gas:  $scope.currentProposal.gasNeeded*2
     }, function(err,data){
       $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(err ? 'Error sending your vote' : 'Voting sent')
          .content(err ? ('Your vote could not be send! '+err) : 'Your vote has been sent, waiting for the transaction to be confirmed.')
          .ariaLabel('Voting sent')
          .ok('Got it!')
          .targetEvent(ev)
      );
    
     });
   };
   
   
   function loadProposal(idx,cb) {
      contract.proposals(idx,function(err,proposal){
         var p = { 
            id             : idx,
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
            creator        : proposal[11],
            enabled        : true
         };
         
         // add the filter-values.
         p.active = p.votingDeadline.getTime() > new Date().getTime() && p.open;
         p.split  = p.newCurator ? true : false;
         
         // because we have only one description-string, we check, if there are more than one line, 
         // we split it into title and rest and try to format the rest as markup. 
         if (p.description.indexOf('\n')>0) {
             var firstLine = p.description.substring(0,p.description.indexOf('\n'));
             p.descriptionHTML = marked(p.description.substring(firstLine.length+1));
             p.description=firstLine;
         }
         
         cb(p);
      });
   }

   // read the total number of tokens   
   contract.totalSupply(function(err,d){
       $scope.total=d.toNumber();
   });
   
   // read the total number of Proposals ...
   contract.numberOfProposals(function(err,d){
      var all = $scope.allProposals =  web3.toBigNumber(d).toNumber();
      
      // ... and now load each one of them.
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
   
   
   
   
}  

})(); 
   
   
   
   
   