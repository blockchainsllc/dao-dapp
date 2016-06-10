module.exports = function () {
   return {
      restrict: 'A',
      link: function ($scope, ngElement, attributes) {
         var element = ngElement[0];
         $scope.$watch(attributes.collapse, function (collapse) {
            if (collapse && element.style.display == 'none') {
               element.style.height = '0px';
               element.style.transform = "scaleY(0)";
               return;
            }
            if (!collapse) element.style.display = 'block';
            var autoHeight = getElementAutoHeight();
            var newHeight = collapse ? 2 : autoHeight;
            element.style.height = newHeight + 'px';
            if (newHeight > 2) element.style.height = 'auto';
            element.style.opacity = collapse ? 0 : 1;
            element.style.transform = "scaleY(" + (collapse ? 0 : 1) + ")";
            element.style.pointerEvents = collapse ? 'none' : 'auto';
            if (autoHeight > 0)
               element.style.maxHeight = (collapse ? newHeight : autoHeight) + 'px';
            ngElement.toggleClass('collapsed', collapse);
            if (collapse)
            setTimeout(()=>{
               element.style.height=0;
            },300) 

         });

         function getElementAutoHeight() {
            var height = element.getAttribute("autHeight");
            if (height && height > 0) return parseInt(height);
            var currentHeight = getElementCurrentHeight();
            element.style.height = 'auto';
            var autoHeight = getElementCurrentHeight();
            element.style.height = currentHeight;
            getElementCurrentHeight(); // Force the browser to recalc height after moving it back to normal
            element.setAttribute("autHeight", autoHeight);
            return autoHeight;
         }

         function getElementCurrentHeight() {
            return element.offsetHeight
         }
      }
   };
};