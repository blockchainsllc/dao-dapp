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


// define main-controller
function DaoVotingCtrl( $scope, $mdBottomSheet, $mdDialog,  $log, $q, $http,$timeout) {


   $scope.account = "";                           // address of the user to send the transaction from.
   $scope.accounts = [$scope.account];            // the list of users accounts                    
   $scope.filter = { active:true, split: false};  // filter the proposal list 
   $scope.total=1;                                // number of Propsals existing
   $scope.proposals = [];                         // loaded Proposals
   
   $scope.showProposal = function(p,ev) {         // called, when selecting a proposal 
      $scope.currentProposal=p;
      
      if (!p.gasNeeded) {
        // we need to check, if the user already voted. We do this, by calling the vote-function without a transaction and checking if all the gas is used, which means
        // a error was thrown ans so the user is not allowed to vote.
        var gas = 0x999999;
        web3.eth.estimateGas({ to: address, data: buildVoteFunctionData(p.id,true), from: $scope.account, gas: gas, }, function(err,data) {
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
         data: buildVoteFunctionData($scope.currentProposal.id,accept), 
         from: $scope.account, 
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

   // the address of the dao
   var address = "0xbb9bc244d798123fde783fcc1c72d3bb8c189413";
   address  ="0xad23d7c443382333543dd13c3b77b99b2a7e2c6d"; // just for testing, we use a test-dao

   // pick up the global web3-object injected by mist.
   if(typeof web3 !== 'undefined')
      web3 = new Web3(web3.currentProvider);
   else
      web3 = new Web3(new Web3.providers.HttpProvider("http://37.120.164.112:8555"));

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
    {name:"vote", "type":"function","outputs":[
       {"type":"uint256","name":"_voteID"}],"inputs":[
       {"type":"uint256","name":"_proposalID"}, 
       {"type":"bool","name":"_supportsProposal"}],"constant":false},
    {name:"numberOfProposals","type":"function","outputs":[
      {"type":"uint256","name":"_numberOfProposals"}],"inputs":[],"constant":true}
   ];

   var contract = web3.eth.contract(abi).at(address);

   // builds the data for the vote-function   
   function buildVoteFunctionData(proposal, supports) {
      return contract.vote.getData(proposal, supports);
   }

   // loads one Proposal by calling the proposals(index)-function.
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
            split          : proposal[8],
            yea            : proposal[9].toNumber(),
            nay            : proposal[10].toNumber(),
            creator        : proposal[11],
            enabled        : true
         };
         
         // add the filter-values.
         p.active = p.votingDeadline.getTime() > new Date().getTime() && p.open;
         
         // because we have only one description-string, we check, if there are more than one line, 
         // we split it into title and rest and try to format the rest as markup. 
         if (p.description.indexOf('\n')>0) {
             var firstLine = p.description.substring(0,p.description.indexOf('\n'));
             p.descriptionHTML = marked(p.description.substring(firstLine.length+1));
             p.description=firstLine;
         }
         
         // return the result to callback
         cb(p);
      });
   }

   // read the total number of tokens   
   contract.totalSupply(function(err,d){
       $scope.total=d.toNumber();
   });
   
   web3.eth.getAccounts(function(error, result){  
     $scope.accounts = result;
     $scope.account = result && result.length>0 && results[0];
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
   
   
   
   
   