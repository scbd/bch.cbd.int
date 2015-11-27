define(['text!./analyzer.html', 'app', 'lodash', 'require', 'jquery', './analyzer-section', 'filters/lstring', 'filters/cases'],
        function(templateHtml, app, _, require, $) { 'use strict';

    var baseUrl = require.toUrl('');

    //====================================
    //
    //
    //====================================
    function mapReduce(key) {

        return function(map, v) {

            if(key) map[v[key]] = v;
            else    map[v]      = v;

            return  map;

        };
    }

    var affixTop = 600;

    //==============================================
    //
    //
    //==============================================
    app.directive('nationalReportAnalyzer', ['$http', '$q', 'locale', '$filter', function($http, $q, locale, $filter) {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            require : 'nationalReportAnalyzer',
            scope :  {
                getSelectedRegions: '&regions',
                getSelectedQuestions: '&questions',
                getSelectedReportType: '&reportType'
            },
            link: function ($scope, $element, attr, nrAnalyzer) {

                affixTop = Math.min(Math.round($element.offset().top), affixTop) - 10 ;
                $element.find(".filter.panel").affix({ offset: { top : affixTop } });

                $scope.allRegionsMap = {};

                $scope.limit = 0;
                $scope.filters = [];
                $scope.filtersCountriesMap = {};
                $scope.sumType = 'sum';
                $scope.sumTypes = ['sum', 'percentGlobal', 'percentRow', 'percentColumn' ];

                load();

                //====================================
                //
                //
                //====================================
                function load() {


                    $scope.limit = 0;
                    $scope.infinitScrollVisible = true;
                    $scope.filter = undefined;

                    $q.all([loadRegions(), loadSections(), nrAnalyzer.loadReports()]).then(function(results) {

                        var regions  = results[0];
                        var sections = results[1];
                        var reports  = results[2];

                        var reportsCountriesMap = _(reports).pluck('government').sortBy().map(function(id){
                            return $scope.allRegionsMap[id];
                        }).reduce(mapReduce('identifier'), {});

                        regions = _.map(regions, function(region){

                            region.htmlTitle    = htmlTitle(region.shortTitle, region.title);
                            region.countriesMap = _.pick(reportsCountriesMap, [region.identifier].concat(region.expandedNarrowerTerms||region.narrowerTerms||[]));
                            region.countries    = _.keys(region.countriesMap);

                            return region;
                        });

                        $scope.regions = regions;
                        $scope.sections = sections;

                    }).then(function(){

                        if($scope.sections && $scope.sections.length) {
                            nrAnalyzer.toggleSection($scope.sections[0].key, true);
                        }
                    });
                }

                //====================================
                //
                //
                //====================================
                function loadRegions() {

                    var lstring = $filter('lstring');

                    var countries = $http.get('/api/v2013/thesaurus/domains/countries/terms', { cache : true }).then(function(res) {
                        return res.data;
                    });

                    var regions = $http.get('/api/v2013/thesaurus/domains/regions/terms?relations', { cache : true }).then(function(res) {
                        return res.data;
                    });

                    return $q.all([countries, regions]).then(function(results){

                        var allRegionsMap = _(results).flatten().reduce(mapReduce('identifier'), {});

                        $scope.allRegionsMap = allRegionsMap;

                        return _($scope.getSelectedRegions()).map(function(id) {
                            return allRegionsMap[id];
                        }).sortBy(function(term) {
                            return lstring(term.shortTitle) || lstring(term.title);
                        }).value();
                    });
                }

                //====================================
                //
                //
                //====================================
                function loadSections() {

                    var reportType = $scope.getSelectedReportType();

                    return $http.get(baseUrl+'resources/national-reports/'+locale+'/'+reportType+'.json', { cache : true }).then(function(res) {

                        var selection = _($scope.getSelectedQuestions()).reduce(mapReduce(), {});

                        return _.filter(res.data, function(section) {

                            section.questions = _.filter(section.questions, function(q) {
                                return selection[q.key];
                            });

                            return section.questions.length;
                        });
                    });
                }

                //====================================
                //
                //
                //====================================
                function htmlTitle(shortTitle, title) {

                    var lstring = $filter('lstring');

                    shortTitle = lstring(shortTitle);

                    if(shortTitle)
                        return htmlEncode(shortTitle).split(/[\-–]/).join('<br>');

                    return htmlEncode(lstring(title));
                }

                //====================================
                //
                //
                //====================================
                function htmlEncode(value){
                  return $('<div/>').text(value).html();
                }

                //==============================================
                //
                //
                //==============================================
                $scope.showSumTypeSelector = function() {
                    nrAnalyzer.showSumTypeSelector(true);
                };

                //====================================
                //
                //
                //====================================
                $scope.setSumType = function(type) {
                    $scope.sumType = type;
                    nrAnalyzer.showSumTypeSelector(false);
                };

                //====================================
                //
                //
                //====================================
                $scope.clearFilter = function() {
                    nrAnalyzer.filter(undefined);
                };

                //====================================
                //
                //
                //====================================
                $scope.showSettings = function() {
                    $scope.$emit('nr.analyzer.settings');
                };

                //====================================
                //
                //
                //====================================
                var sumTypeDialog = $element.find("#sumTypeDialog");

                sumTypeDialog.on("shown.bs.modal",    function() { $scope.$apply(function() { $scope.sumTypeDialogVisible = true;  }); });
                sumTypeDialog.on("hidden.bs.modal",   function() { $scope.$apply(function() { $scope.sumTypeDialogVisible = false; }); });
                $scope.$watch('sumTypeDialogVisible', function(visible) {

                    if(sumTypeDialog.is(":visible") != (visible || false)) {

                        if(visible) sumTypeDialog.modal('show');
                        else        sumTypeDialog.modal('hide');
                    }
                });


                //====================================
                //
                //
                //====================================
                var textsDialog = $element.find("#textsDialog");

                textsDialog.on("shown.bs.modal",  function() { textsDialog.find(".modal-body").scrollTop(0); });
                textsDialog.on("shown.bs.modal",  function() { $scope.$apply(function() { $scope.textsDialogVisible = true;  }); });
                textsDialog.on("hidden.bs.modal", function() { $scope.$apply(function() { $scope.textsDialogVisible = false; }); });
                $scope.$watch('textsDialogVisible', function(visible) {

                    if(sumTypeDialog.is(":visible") != (visible || false)) {

                        if(visible) textsDialog.modal('show');
                        else        textsDialog.modal('hide');
                    }
                });
            },

            controller : ['$scope', function($scope){

                var _self = this;

                //====================================
                //
                //
                //====================================
                this.showSumTypeSelector = function(visible) {

                    if(visible===undefined)
                        visible = true;

                    $scope.sumTypeDialogVisible = visible;
                };

                //====================================
                //
                //
                //====================================
                this.showTexts = function(countriesTexts, question) {

                    var lstring = $filter('lstring');

                    countriesTexts = _.sortBy(countriesTexts||[], function(item){
                        return lstring($scope.allRegionsMap[item.government].title);
                    });

                    $scope.currentQuestion = question;
                    $scope.countriesTexts  = countriesTexts;
                    $scope.textsDialogVisible = !_.isEmpty(countriesTexts);
                };

                //====================================
                //
                //
                //====================================
                this.toggleSection = function(sectionName, expanded) {

                    var section = _.findWhere($scope.sections||[], { key : sectionName });

                    if(!section)
                        return;

                    if(expanded === undefined)
                        expanded = !section.expanded;

                    expanded = !!expanded; // !! force boolean

                    if(section.reports) {

                        section.expanded = expanded;

                        return $q.resolve(expanded);

                    }

                    return _self.loadReports({

                        questions : _.pluck(section.questions, 'key').concat(['documentId'])

                    }).then(function(reports){

                        section.reports  = reports;
                        section.expanded = expanded;

                        return expanded;

                    });
                };

                //====================================
                //
                //
                //====================================
                this.filter = function(filter) {

                    if(!arguments.length) {
                        return $scope.filter;
                    }

                    $scope.filter = filter;
                    $scope.$broadcast('nr.analyzer.filter', filter);
                };

                //====================================
                //
                //
                //====================================
                this.loadReports = function(options) {

                    options = _.defaults(options||{}, {
                        reportType : $scope.getSelectedReportType(),
                        regions : $scope.getSelectedRegions(),
                        questions : []
                    });

                    var query  = { 'government_REL' : { $in: options.regions } };
                    var fields = _(options.questions).union(['government']).reduce(function(ret, key) {
                        ret[key] = 1;
                        return ret;
                    }, {});

                    var collectionUrls = {
                        cpbNationalReport2 : "/api/v2015/national-reports-cpb-2",
                        cpbNationalReport3 : "/api/v2015/national-reports-cpb-3"
                    };

                    return $http.get(collectionUrls[options.reportType], {  params: { q : query, f : fields }, cache : true }).then(function(res) {

                        return _.map(res.data, function(report) {
                            return _.mapValues(report, toRawValue);
                        });
                    });

                    function toRawValue(v) {

                        if(_.isArray(v))
                            return _.map(v, toRawValue);

                        v = v.value || v.identifier || v;

                        if(typeof(v)=='boolean')
                            v = v.toString();

                        return v;
                    }
                };
            }]
        };
    }]);
});
