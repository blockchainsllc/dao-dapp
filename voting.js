(function(){


   // pick up the global web3-object injected by mist.
   if(typeof web3 !== 'undefined')
      web3 = new Web3(web3.currentProvider);
   else
      web3 = new Web3(new Web3.providers.HttpProvider("http://37.120.164.112:8555"));
      

      
   // define the module
   angular
   .module('daovoting', [ 'ngMaterial', 'ngAnimate','ngMessages' ,'ui.identicon','ngSanitize'])
   // main controller
   .controller('DaoVotingCtrl', [ '$scope',  '$mdDialog', '$parse', '$filter', DaoVotingCtrl ])
   
   // format number
   .filter('ethnumber', function() {
      return function(val) {
        if (val > 1000000) return web3.toBigNumber(val/1000000).toFixed(2)+" M";
        else if (val > 1000) return web3.toBigNumber(val/1000).toFixed(2)+" K";
        return web3.toBigNumber(val).toFixed(2);
      };
    })

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
          element.style.transform = "scaleY("+(collapse ? 0.4 : 1)+")";
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
      .primaryPalette('blue')
      .accentPalette('red');
   }) ;


// define main-controller
function DaoVotingCtrl( $scope, $mdDialog, $parse, $filter) {

   // the address of the dao
   var address = "0xbb9bc244d798123fde783fcc1c72d3bb8c189413";
   address  ="0x159fe90ac850c895e4fd144e705923cfa042d974"; // just for testing, we use a test-dao
   var defaultAccounts = web3.eth.accounts;
   if (!defaultAccounts || defaultAccounts.length==0) defaultAccounts=[address];

   $scope.account = defaultAccounts[0];           // address of the user to send the transaction from.
   $scope.accounts = defaultAccounts;             // the list of users accounts                    
   $scope.filter = { active:true, split: false};  // filter the proposal list 
   $scope.total=1;                                // total Supply
   $scope.proposals = [];                         // loaded Proposals
   
   $scope.showProposal = function(p,ev) {         // called, when selecting a proposal 
      $scope.currentProposal=p;
      
      if (!p.gasNeeded[$scope.account]) {
        // we need to check, if the user already voted. We do this, by calling the vote-function without a transaction and checking if all the gas is used, which means
        // a error was thrown ans so the user is not allowed to vote.
        var gas = 0x999999;
        console.log("check gas for ", $scope.account);
        web3.eth.estimateGas({ to: address, data: buildVoteFunctionData(p.id,true), from: $scope.account, gas: gas, }, function(err,data) {
           // only if the estimated gas is lower then the given we knwo it would be succesful, otherwise all the gas is used, because a exception is thrown.
           console.log("gas was ", data);
           p.enabled   = data < gas && $scope.account!=address; // it is only allowed if no error was thrown and if we didn't use the address-account, which is simply used as fallback for showing as readonly.
           p.gasNeeded[$scope.account] = data;
           refresh();
           
        });
      }
   };
   
   $scope.sendVotingTransaction = function(ev, accept) {
     web3.eth.sendTransaction({
         to  : address, 
         data: buildVoteFunctionData($scope.currentProposal.id,accept), 
         from: $scope.account, 
         gas:  $scope.currentProposal.gasNeeded[$scope.account]*2 
     }, function(err,data){
        showAlert(err ? 'Error sending your vote' : 'Voting sent', err ? ('Your vote could not be send! '+err) : 'Your vote has been sent, waiting for the transaction to be confirmed.',ev);
     });
   };




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
         if (err) {
             showAlert('Error getting the proposal '+idx, err);
             return;
         }
         var p = { 
            id             : idx,
            recipient      : proposal[0],
            amount         : web3.fromWei(proposal[1],"ether").toNumber(),
            description    : proposal[2].replace(/<br>/g, '\n').replace(/\\n/g, '\n'),
            votingDeadline : new Date(proposal[3].toNumber() * 1000),
            open           : proposal[4],
            proposalPassed : proposal[5],
            proposalHash   : proposal[6],
            proposalDeposit: web3.fromWei(proposal[7],"ether").toNumber(),
            split          : proposal[8],
            yea            : web3.fromWei(proposal[9],"ether").toNumber(),
            nay            : web3.fromWei(proposal[10],"ether").toNumber(),
            creator        : proposal[11],
            enabled        : true,
            minQuroum      : function() {
              var totalInWei = web3.toWei($scope.total,"ether");
              return  web3.fromWei( 
                totalInWei / $scope.minQuorumDivisor + 
                ( web3.toWei(this.amount,"ether")   * totalInWei) / (3 * ($scope.actualBalance + $scope.rewardToken)),"ether");
            },
            gasNeeded      : {}
            
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
   
   function showAlert(title,msg,ev) {
     $mdDialog.show(
        $mdDialog.alert()
          .clickOutsideToClose(true)
          .title(title)
          .content( msg.message || msg)
          .ariaLabel(title)
          .ok('Got it!')
          .targetEvent(ev)
      );
   }
   
   // this is needed for mist, because it calls the the web3-requests synchron, so we cannot call $apply here.
   var needsRefresh=false;
   function refresh() {
       if (needsRefresh) return;
       // this is just needed because 
       setTimeout(function(){
           needsRefresh=false;
           $scope.$apply();
       },10);
   }
    

   // read the total number of tokens   
   contract.totalSupply(function(err,d){
       if (err) 
          showAlert('Error getting the total supply', err);
       else {
          $scope.total=web3.fromWei(d,"ether").toNumber();
          contract.minQuorumDivisor(function(err,minq){
            $scope.minQuorumDivisor =  minq.toNumber() || 5;
            contract.actualBalance(function(err,bal){
                $scope.actualBalance = bal.toNumber();
                contract.rewardToken(address,function(err,r){
                    $scope.rewardToken = r.toNumber();
                });
            });
          });
       }
   });
   
   // read the total number of Proposals ...
   contract.numberOfProposals(function(err,d){
      if (err) {
            showAlert('Error getting the proposals ', err);
            return;
      }

      var idx = 1;
      $scope.allProposals =  web3.toBigNumber(d).toNumber();
      
      // ... and now load each one of them.
      function nextProposal() {
         if (idx>$scope.allProposals) return; 
         loadProposal(idx++, function(p){
            $scope.proposals.push(p);
            refresh();
            nextProposal();
         }); 
      }
      
      
      
      nextProposal();
   });
   
   
   // init mist-menu

   if (typeof mist !== 'undefined' && mist.mode === 'mist') {
    var headerElement = document.getElementsByTagName('md-toolbar');
    if (headerElement[0]) 
      headerElement[0].style.paddingTop = "55px";




    // add/update mist menu
    var currentEntry = {
        position: 0,
        name: "Current Proposals",
        badge: 0,
        selected: true
    }, prevEntry= {
        position: 1,
        name: "Previous Proposals",
        badge: 0,
        selected: false
    };
    mist.menu.clear();
    

    // update the entries    
    
    function updateEntries() {
      currentEntry.badge    = $filter('filter')($scope.proposals, {active:true, split:$scope.filter.split} ).length;
      prevEntry.badge       = $filter('filter')($scope.proposals, {active:false, split:$scope.filter.split} ).length;
      currentEntry.selected = $scope.filter.active;
      prevEntry.selected    = !$scope.filter.active;
      mist.menu.add('current', currentEntry, function(){
          $scope.filter.active=true;
          refresh();
      });    
      mist.menu.add('previous', prevEntry, function(){
          $scope.filter.active=false;
          refresh();
      });
    }
    $scope.$watch('filter.active', updateEntries);
    $scope.$watch('filter.split', updateEntries);
    $scope.$watch('proposals.length', updateEntries);
    updateEntries();
        
   }         
   
   
   
}  

})(); 
   
   
   
   
   
