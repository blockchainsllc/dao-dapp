import Web3 from 'web3';
import marked from 'marked';
import angular from 'angular';
import ngMaterial from 'angular-material';
import ngAnimate from 'angular-animate';
import ngMessages from 'angular-messages';
import ngSanitize from 'angular-sanitize';
import Identicon from 'identicon.js/identicon';
import Connector from './loader';
window.Identicon = Identicon;
import 'angular-identicon/dist/angular-identicon';


(function(){
  
   var connector = new Connector(window.web3, window.location.hash);
   var web3      = connector.web3;
   var address   = connector.address;
      
   // define the module
   angular
   .module('daovoting', [ ngMaterial, ngAnimate, ngMessages, 'ui.identicon', ngSanitize])
   // main controller
   .controller('DaoVotingCtrl', [ '$scope',  '$mdDialog', '$parse', '$filter', '$http','$sce', DaoVotingCtrl ])
   
   // format number
   .filter('ethnumber', function() {
      return function(val) {
        if (val > 1000000)   return web3.toBigNumber(val/1000000).toFixed(2)+" M";
        else if (val > 1000) return web3.toBigNumber(val/   1000).toFixed(2)+" K";
        return web3.toBigNumber(val).toFixed(2);
      };
    })
   // create ethercamp link
   .filter('ethercamp', function() {
      return function(val) {
        if (val.indexOf("0x")==0) val=val.substring(2);
        return "https://" + (connector.testnet ? "morden":"live") + ".ether.camp/account/"+val;
      };
    })
    .filter('timeleft', function() {
      return function(val) {
         var left = val.getTime()- new Date().getTime();
         if (left<0)
           return val.toLocaleDateString();
            
         if (val>2 * 3600 * 1000 * 24) return parseInt(left/ (3600 * 1000 * 24)) + " days left";
         if (val>2 * 3600 * 1000     ) return parseInt(left/ (3600 * 1000     )) + " hours left";
         if (val>2 * 60 * 1000       ) return parseInt(left/ (60 * 1000       )) + " minutes left";
         return                               parseInt(left/ 1000              ) + " seconds left";
      };
    })
    
   // collapse directive creating a nice accordian-effect when selecting
   .directive('collapse', [function () {
		return {
			restrict: 'A',
			link: function ($scope, ngElement, attributes) {
				var element = ngElement[0];
				$scope.$watch(attributes.collapse, function (collapse) {
          if (collapse && element.style.display == 'none') {
            element.style.height =  '0px';
            element.style.transform = "scaleY(0)";
            return;
          }
          if (!collapse)  element.style.display = 'block';
          var autoHeight =   getElementAutoHeight();
					var newHeight = collapse ? 2 : autoHeight;
					element.style.height = newHeight + 'px';
          element.style.opacity = collapse ? 0 : 1;
          element.style.transform = "scaleY("+(collapse ? 0 : 1)+")";
          element.style.pointerEvents= collapse ? 'none': 'auto';
          if (autoHeight>0)
					   element.style.maxHeight = (collapse ? newHeight :autoHeight) + 'px';
					ngElement.toggleClass('collapsed', collapse);
				});

				function getElementAutoHeight() {
          var height = element.getAttribute("autHeight");
          if (height && height>0) return parseInt(height);
					var currentHeight = getElementCurrentHeight();
					element.style.height = 'auto';
					var autoHeight = getElementCurrentHeight();
					element.style.height = currentHeight;
					getElementCurrentHeight(); // Force the browser to recalc height after moving it back to normal
          element.setAttribute("autHeight",autoHeight);
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
function DaoVotingCtrl( $scope, $mdDialog, $parse, $filter, $http, $sce) {

   var defaultAccounts = connector.accounts;
   $scope.account   = defaultAccounts[0];            // address of the user to send the transaction from.
   $scope.accounts  = defaultAccounts;               // the list of users accounts                    
   $scope.filter    = { active:true, split: false};  // filter the proposal list 
   $scope.total     = 1;                             // total Supply
   $scope.proposals = [];                           // loaded Proposals
   $scope.isMist    = connector.isMist;
   // called, when selecting a proposal 
   $scope.showProposal = function(p,ev) {           
      $scope.currentProposal=p;
      
      // if this proposal was taken from the cache we need to load the current values
      if (p.needsUpdate) loadProposal(p.id, refresh); 
         
      if (!p.gasNeeded[$scope.account] && connector.isMist) {
        // we need to check, if the user already voted. We do this, by calling the vote-function without a transaction and checking if all the gas is used, which means
        // a error was thrown ans so the user is not allowed to vote.
        var gas = 0x999999;
        web3.eth.estimateGas({ to: address, data: buildVoteFunctionData(p.id,true), from: $scope.account, gas: gas, }, function(err,data) {
           // only if the estimated gas is lower then the given we knwo it would be succesful, otherwise all the gas is used, because a exception is thrown.
           p.enabled   = data < gas && $scope.account!=address; // it is only allowed if no error was thrown and if we didn't use the address-account, which is simply used as fallback for showing as readonly.
           p.gasNeeded[$scope.account] = data;
           refresh();
        });
      }
   };
   
   // when the user clicks the vote-buttons
   $scope.sendVotingTransaction = function(ev, accept) {
     web3.eth.sendTransaction({
         to  : address, 
         data: buildVoteFunctionData($scope.currentProposal.id,accept), 
         from: $scope.account, 
         gas:  $scope.currentProposal.gasNeeded[$scope.account]*2 
     }, function(err,data){
        if (!err) {
          // disable the buttons
          $scope.currentProposal.enabled=false;
          refresh();
        }
        showAlert(err ? 'Error sending your vote' : 'Voting sent', err ? ('Your vote could not be send! '+err) : 'Your vote has been sent, waiting for the transaction to be confirmed.',ev);
     });
   };
   
   $scope.openWallet = function() {
     window.open('https://www.myetherwallet.com/embedded-daoproposals.html?id='+$scope.currentProposal.id, 'myetherwallet', 'width=700,height=1000,menubar=no,resizable=yes,status=no,toolbar=no');
   }

 

   // builds the data for the vote-function   
   function buildVoteFunctionData(proposal, supports) {
      return connector.contract.vote.getData(proposal, supports);
   }
   


   // helper function to show a alert.
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
   
   // cache results in the local storage
   function updateCache(p) {
     cachedProposals[p.id-1]=p.data;
     if (localStorage) localStorage.setItem(address,JSON.stringify(cachedProposals));
   }
   var cachedProposals = localStorage && localStorage.getItem(address) && connector.isMist ? (JSON.parse(localStorage.getItem(address)) || []) : [];
   cachedProposals.forEach(function(data,i) { 
     $scope.proposals.push(createProposal(i+1,data,true)) 
   });

   function updateSplitAmount(p) {
      if (p.active && p.split) 
        p.amount =  (p.yea * web3.fromWei($scope.actualBalance)) / $scope.total;     
   }

   // creates a proposal-object from the data delivered by the web3-object
   function createProposal(idx, proposal, fromCache) {
     var p = { 
        id             : idx,
        recipient      : proposal[0],
        amount         : web3.fromWei(web3.toBigNumber(proposal[1]),"ether").toNumber(),
        content        : proposal[2],
        description    : proposal[2].replace(/<br>/g, '\n').replace(/\\n/g, '\n'),
        votingDeadline : new Date(web3.toBigNumber(proposal[3]).toNumber() * 1000),
        open           : proposal[4],
        proposalPassed : proposal[5],
        proposalHash   : proposal[6],
        proposalDeposit: web3.fromWei(web3.toBigNumber(proposal[7]),"ether").toNumber(),
        split          : proposal[8],
        yea            : web3.fromWei(web3.toBigNumber(proposal[9]),"ether").toNumber(),
        nay            : web3.fromWei(web3.toBigNumber(proposal[10]),"ether").toNumber(),
        creator        : proposal[11],
        enabled        : connector.isMist,
        minQuroum      : function() {
          var totalInWei = web3.toWei($scope.total,"ether");
          return  web3.fromWei( 
            totalInWei / $scope.minQuorumDivisor + 
            ( web3.toWei(this.amount,"ether")   * totalInWei) / (3 * ($scope.actualBalance + $scope.rewardToken)),"ether");
        },
        gasNeeded      : {},
        data           : proposal,
        needsUpdate    : fromCache ? true : false,
        walletUrl      : $sce.trustAsResourceUrl('https://www.myetherwallet.com/embedded-daoproposals.html?id='+idx)
      };

      // define the type of proposal
      if (p.split) 
        p.type = p.recipient == p.creator ? 'solosplit' : 'fork';
      else 
        p.type = p.recipient == address && p.amount==0 ? 'informal' : 'proposal';
        
      // add the filter-values.
      p.active = p.votingDeadline.getTime() > new Date().getTime() && p.open;
      
      updateSplitAmount(p);

      // if the description contains JSON, we take the fields from there
      if (p.description.indexOf('{')==0) {
        var meta = JSON.parse(p.description);
        p.description = meta.title;
        p.descriptionHTML = marked(meta.description || "");
        if (p.url) p.descriptionHTML+='<p><a href="'+p.url+'" target="_new">more<a></p>';
      }
       
      // because we have only one description-string, we check, if there are more than one line, 
      // we split it into title and rest and try to format the rest as markup.
      if (p.description.indexOf('\n')>0) {
          var firstLine = p.description.substring(0,p.description.indexOf('\n'));
          p.descriptionHTML = marked(p.description.substring(firstLine.length+1));
          p.description=firstLine;
      }
      
      else if (p.description.length>200) {
        // find a good position to split
        var pos = p.description.indexOf(". ",50);
        if (pos<0) pos = pos.indexOf(";",50);
        if (pos<0) pos = pos.indexOf(" ",200);
        if (pos<0) pos = pos.indexOf(" ",50);
        if (pos<0) pos = 250;
        firstLine = p.description.substring(0,pos+1);
        p.descriptionHTML = marked(p.description.substring(firstLine.length));
        p.description=firstLine;
      }
      
      // if the proposal is already loaded, we want replace the values of it.      
      var existing = $scope.proposals[idx-1];
      if (existing) {
         for(var k in p) {
           if (k!='enabled' && k!='gasNeeded') existing[k]=p[k]; 
         }
         p=existing;
      }
      
      return p;
   }

   // loads one Proposal by calling the proposals(index)-function.
   function loadProposal(idx,cb) {
      connector.loadProposal(idx,function(err,proposal){
         if (err) {
             showAlert('Error getting the proposal '+idx, err);
             return;
         }
         
         var p = createProposal(idx,proposal);
         // store it in the local storagfe
         updateCache(p);
         // return the result to callback
         cb(p);
      });
   }
   
   
   $scope.reload = function(force) {
    if (force) delete connector.stats;
    connector.getStats($http, function(err, stats){
      $scope.total            = stats.total;
      $scope.minQuorumDivisor = stats.minQuorumDivisor;
      $scope.actualBalance    = stats.actualBalance;
      $scope.rewardToken      = stats.rewardToken;
      $scope.allProposals     = stats.allProposals;     
      $scope.proposals.forEach(updateSplitAmount);
      
      var idx = $scope.proposals.length+1;
        
        // check if the proposal came from cache and needs to be updated
        function nextReload(p) {
          while (p && !p.needsUpdate) p=$scope.proposals[p.id];
          if (p) loadProposal(p.id, nextReload);
        }
        
        // ... and now load each one of them.
        function nextProposal() {
          // after we read the missing, we read try to update the current ones as needed.
          if (idx>$scope.allProposals) return nextReload($scope.proposals[0]); 
              
          loadProposal(idx++, function(p){
              $scope.proposals[p.id-1]=p;
              refresh();
              nextProposal();
          }); 
        }
        
        // first read all missing proposals
        nextProposal();
      
    });
   };
   $scope.reload();
   
   // init mist-menu
   if (typeof mist !== 'undefined' && mist.mode === 'mist') {

      var headerElement = document.getElementsByTagName('md-toolbar');
      if (headerElement[0])  headerElement[0].style.paddingTop = "55px";

    // update the entries    
    function updateEntries() {
      mist.menu.add('current', {
        position: 0,
        name: "Current Proposals",
        badge: $filter('filter')($scope.proposals, {active:true, split:$scope.filter.split, content:$scope.filter.content} ).length,
        selected: $scope.filter.active
      }, function(){
          $scope.filter.active=true;
          refresh();
      });    
      
      mist.menu.add('previous', {
        position: 1,
        name: "Previous Proposals",
        badge:  $filter('filter')($scope.proposals, {active:false, split:$scope.filter.split, content:$scope.filter.content} ).length,
        selected: !$scope.filter.active
      }, function(){
          $scope.filter.active=false;
          refresh();
      });
      
    }
    
    
    $scope.$watch('filter.content', updateEntries);
    $scope.$watch('filter.active', updateEntries);
    $scope.$watch('filter.split', updateEntries);
    $scope.$watch('proposals.length', updateEntries);
    
    // add/update mist menu
    mist.menu.clear();
    updateEntries();
    
   }         
   
   
   
}  

})(); 
   
   
   
   
   
