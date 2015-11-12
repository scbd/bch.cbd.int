define(['text!./terms-dialog.html', 'app', 'lodash', 'filters/ascii', 'filters/lstring', 'directives/intermediate'], function(templateHtml, app, _) {

    //==============================================
    //
    //
    //==============================================
    app.directive('termsDialog', ['$http', '$timeout', '$q', '$filter', function($http, $timeout, $q, $filter) {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            scope :  {
                termsFn : '&terms',
                title : '@',
                columnCountFn : '&columns',
                selection : '=',
                visible : '='
            },
            link: function ($scope, $dialog) {

                var allTerms = [];

                //====================================
                //
                //
                //====================================
                $scope.clearSelection = function() {

                    allTerms.forEach(function(t){
                        t.selected = false;
                    });

                    $scope.onSelect();
                };

                //====================================
                //
                //
                //====================================
                $scope.onSelect = function(term) {

                    if(term) {
                        applyIntermediateState(term);
                    }

                    if(!_.isArray($scope.selection)) { // Try to keep array instance
                        $scope.selection = [];
                    }

                    $scope.selection.length = 0; // Clear array content;

                    _.where(allTerms, {selected : true}).forEach(function(t){

                        if(t.selected) {
                            $scope.selection.push(t.identifier);
                        }
                    });

                    if(!$scope.selection.length) {
                        $scope.selection = undefined;
                    }
                };

                //====================================
                //
                //
                //====================================
                function applyIntermediateState(term) {

                    var root = term;

                    getParents(term).forEach(function(o){
                        o.selected = false;
                        root = o;
                    });

                    getChildren(term).forEach(function(o){
                        o.selected = false;
                    });

                    var branchTerms = getChildren(root);

                    branchTerms.push(root);

                    branchTerms.forEach(function(o) {
                        o.selected = o.selected || false;
                    });

                    _.where(branchTerms, {selected : true}).forEach(function(o) {

                        getParents(o).forEach(function(u){
                            u.selected = null;
                        });

                        getChildren(o).forEach(function(u){
                            u.selected = null;
                        });
                    });
                }

                //====================================
                //
                //
                //====================================
                function getParents(term) {

                    var parents = [];
                    var parent = term.parent;

                    while (parent) {
                        parents.push(parent);
                        parent = parent.parent;
                    }

                    return parents;
                }

                //====================================
                //
                //
                //====================================
                function getChildren(term) { // Deep-first

                    var children = [];

                    term.children.forEach(function(child) {

                        if(child.children && child.children.length) {
                            children = children.concat(getChildren(child));
                        }

                        children.push(child);
                    });

                    return children;
                }

                //====================================
                //
                //
                //====================================
                $scope.$watch("visible", function(visible) {

                    if($dialog.is(":visible") == visible)
                    return;

                    if(visible) $dialog.modal('show');
                    else        $dialog.modal('hide');
                });

                //====================================
                //
                //
                //====================================
                function initialize(terms) {


                    //Cleanup + mapping

                    var termsMap = {};

                    terms.forEach(function(term){

                        term.selected = false;
                        term.parent   = null;
                        term.children = [];

                        termsMap[term.identifier] = term;

                    });

                    var lstring = $filter('lstring');
                    var ascii   = $filter('ascii');

                    terms.sort(function(a,b){

                        var ta = ascii(lstring(a.title)).toLowerCase();
                        var tb = ascii(lstring(b.title)).toLowerCase();

                        return ta.localeCompare(tb);
                    });

                    // Build tree

                    terms.forEach(function(term){

                        term.narrowerTerms.forEach(function(narrowerId){

                            if(termsMap[narrowerId]) {
                                termsMap[narrowerId].parent = term;
                                term.children.push(termsMap[narrowerId]);
                            }
                        });

                    });

                    allTerms = terms;
                    terms = _.where(terms, { parent : null });

                    // Apply selection

                    var selection = $scope.selection;

                    if(_.isString(selection))
                    selection = [selection];

                    if(!_.isArray(selection))
                    selection = [];

                    selection.forEach(function(id) {

                        if(termsMap[id]) {

                            termsMap[id].selected = true;
                            applyIntermediateState(termsMap[id]);
                        }
                    });

                    // split by columns

                    var colCount = Math.max($scope.columnCountFn()||1, 1);

                    $scope.columns = [];

                    for(var i=0; i<colCount; ++i)
                        $scope.columns.push([]);

                    terms.forEach(function(term, index) {
                        $scope.columns[index % colCount].push(term);
                    });
                }

                //====================================
                //
                //
                //====================================
                $dialog.on("show.bs.modal", function() {

                    $timeout(function() {

                        $scope.loading = true;

                        $q.when($scope.termsFn()).then(function(terms){

                            return initialize(terms);

                        }).finally(function(){

                            delete $scope.loading;

                        });
                    });
                });

                //====================================
                //
                //
                //====================================
                $dialog.on("shown.bs.modal", function() {

                    $timeout(function() {  //Use $timeout to Force angular context
                        $scope.visible = true;
                    });
                });

                //====================================
                //
                //
                //====================================
                $dialog.on("hidden.bs.modal", function() {

                    $timeout(function() {  //Use $timeout to Force angular context
                        $scope.visible = false;
                    });
                });
            }
        };
    }]);
});
