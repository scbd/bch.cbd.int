define(['app', 'jquery'], function(app, $) {

    app.directive('infinitScroll', ['$parse', function($parse) {

        return {
            restrict : 'A',
            link: function ($scope, $el, $attr) {

                var registered = false;
                var pollInProgress = false;
                var nextPageFn = $parse($attr.infinitScroll);
                var options = $scope.$eval($attr.infinitScrollOptions)||{};

                options.offset = options.offset || 0;

                //========================================
                //
                //
                //========================================
                function pollNextPage() {

                    if(!$scope || !$scope.$root) {
                        deregister();
                        return;
                    }

                    if(pollInProgress) {
                        return;
                    }

                    if(!$el.is(':visible')) {
                        return;
                    }

                    try {

                        pollInProgress = true;

                        var offsetTop = $el.offset().top;
                        var scrollBottom = $(window).scrollTop() + $(window).height();

                        if(offsetTop <= (scrollBottom + options.offset)) { // Reached

                            $scope.safeApply(function(){

                                var result = nextPageFn($scope);

                                if(result===false)
                                    deregister();
                            });
                        }
                    }
                    catch (e) {

                        throw e;
                    }
                    finally {

                        pollInProgress = false;
                    }


                }

                //========================================
                //
                //
                //========================================
                function register(){

                    if(registered)
                        return;

                    registered = true;

                    $(window  ).on('load resize', pollNextPage);
                    $(document).on('load resize scroll', pollNextPage);
                }

                //========================================
                //
                //
                //========================================
                function deregister(){
                    if(!registered)
                        return;

                    $(window  ).off('load resize', pollNextPage);
                    $(document).off('load resize scroll', pollNextPage);
                    registered = false;
                }

                //========================================
                //
                //
                //========================================
                $scope.$watch(function(){ // On digest
                    if(registered) {
                        pollNextPage();
                    }
                });

                //========================================
                //
                //
                //========================================
                $scope.safeApply = function(fn) {
                  var phase = this.$root.$$phase;
                  if(phase == '$apply' || phase == '$digest') {
                    if(fn && (typeof(fn) === 'function')) {
                      fn();
                    }
                  } else {
                    this.$apply(fn);
                  }
                };

                register();
            }
        };
    }]);
});
