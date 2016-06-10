//var $ = require('jquery');

module.exports = function () {
   return {
      restrict: 'A',
      link: function ($scope, ngElement, attributes) {
         var element = ngElement[0];
         $scope.$watch(attributes.collapse, function (collapse) {
            element.style.height = element.style.maxHeight = collapse ? '0px' : element.scrollHeight;
//            element.style.transform = "scaleY(" + (collapse ? 0.5 : 1) + ")";
            element.style.opacity = collapse ? 0 : 1;
         });
      }
   };
};