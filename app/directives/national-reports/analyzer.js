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
                maxDate: '=maxDate',
                selectedRegions: '=regions',
                selectedQuestions: '=questions',
                selectedReportType: '=reportType'
            },
            link: function ($scope, $element, attr, nrAnalyzer) {

                $element.find("#sumTypeButton").affix({ offset: { top : -1 } });
                $element.find("#filterBox"    ).affix({ offset: { top : 340 } });

                $scope.allRegionsMap = {};

                $scope.filters = [];
                $scope.filtersCountriesMap = {};

                $scope.sumType  = 'percentGlobal';
                $scope.sumTypes = ['percentGlobal', 'percentColumn', 'percentRow', 'sum' ];

                //====================================
                //
                //
                //====================================
                var loaded = false;
                $scope.$watch('selectedRegions',    function() { if(!loaded) load(); });
                $scope.$watch('selectedQuestions',  function() { if(!loaded) load(); });
                $scope.$watch('selectedReportType', function() { if(!loaded) load(); });

                //====================================
                //
                //
                //====================================
                function load() {

                    if(!$scope.selectedRegions)    return;
                    if(!$scope.selectedQuestions)  return;
                    if(!$scope.selectedReportType) return;

                    loaded = true;
                    $scope.filter = undefined;

                    $q.all([loadRegions(), loadSections(), nrAnalyzer.loadReports(), loadPreviousReportQuestionsMapping()]).then(function(results) {

                        var regions  = results[0];
                        var sections = results[1];
                        var reports  = results[2];
                        var previousQuestionsMapping = results[3];

                        var reportsCountriesMap = _(reports).pluck('government').sortBy().map(function(id) {

                            return $scope.allRegionsMap[id];

                        }).reduce(mapReduce('identifier'), {});

                        regions = _.map(regions, function(region){

                            region.htmlTitle = htmlTitle(region.shortTitle, region.title);
                            region.countries = _([region.identifier])
                                .union(region.expandedNarrowerTerms || region.narrowerTerms || [])
                                .sort()
                                .map(function(id) {
                                    return reportsCountriesMap[id];
                                })
                                .compact()
                                .value();

                            return region;
                        });

                        $scope.regions = regions;
                        $scope.sections = sections;
                        $scope.previousQuestionsMapping = previousQuestionsMapping;

                    }).then(function(){

                        if($scope.sections && $scope.sections.length)
                            nrAnalyzer.toggleSection($scope.sections[0].key, true);

                    });
                }

                //====================================
                //
                //
                //====================================
                function loadRegions() {

                    var lstring = $filter('lstring');

                    var countries = $http.get('/api/v2013/thesaurus/domains/countries/terms', { cache : true }).then(function(res) {
                        return _.map(res.data, fixEUR);
                    });

                    var regions = $http.get('/api/v2013/thesaurus/domains/regions/terms?relations', { cache : true }).then(function(res) {
                        return _.map(res.data, fixEUR);
                    });

                    return $q.all([countries, regions]).then(function(results){

                        var allRegionsMap = _(results).flatten().reduce(mapReduce('identifier'), {});

                        $scope.allRegionsMap = allRegionsMap;

                        return _($scope.selectedRegions).map(function(id) {

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
                function fixEUR(term) {
                    if(term.identifier=="eu")
                        term.identifier = 'eur';
                    return term;
                }

                //====================================
                //
                //
                //====================================
                function loadPreviousReportQuestionsMapping() {

                    var reportType = $scope.selectedReportType;

                    return $http.get(baseUrl+'resources/national-reports/mapping/'+reportType+'.json', { cache : true }).then(function(res) {

                        return res.data;

                    }).catch(function() {

                        return undefined;

                    });
                }

                //====================================
                //
                //
                //====================================
                function loadSections() {

                    var reportType = $scope.selectedReportType;

                    return $http.get(baseUrl+'resources/national-reports/'+locale+'/'+reportType+'.json', { cache : true }).then(function(res) {

                        var selection = _($scope.selectedQuestions).reduce(mapReduce(), {});

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

                sumTypeDialog.on("shown.bs.modal",    function() { sumTypeDialog.find('button').focus(); });
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
                textsDialog.on("shown.bs.modal",  function() { textsDialog.find('button').focus(); });
                textsDialog.on("shown.bs.modal",  function() { $scope.$apply(function() { $scope.textsDialogVisible = true;  }); });
                textsDialog.on("hidden.bs.modal", function() { $scope.$apply(function() { $scope.textsDialogVisible = false; }); });
                $scope.$watch('textsDialogVisible', function(visible) {

                    if(sumTypeDialog.is(":visible") != (visible || false)) {

                        if(visible) textsDialog.modal('show');
                        else        textsDialog.modal('hide');
                    }
                });
            },

            controller : ['$scope', '$http', function($scope, $http) {

                var nrAnalyzer = this;
                var isScbd = false;

                $http.get('/api/v2013/authentication/user').then(function(res){
                    isScbd = !!~res.data.roles.indexOf('ScbdStaff');
                });

                //====================================
                //
                //
                //====================================
                nrAnalyzer.showSumTypeSelector = function(visible) {

                    if(visible===undefined)
                        visible = true;

                    $scope.sumTypeDialogVisible = visible;
                };

                //====================================
                //
                //
                //====================================
                nrAnalyzer.showTexts = function(countriesTexts, question) {

                    var lstring = $filter('lstring');

                    countriesTexts = _.sortBy(countriesTexts||[], function(item){
                        return lstring($scope.allRegionsMap[item.government].title);
                    });

                    if(!isScbd) { // drop courtesy translation (locale*) if not SCBD;
                        countriesTexts = _.map(countriesTexts, function(t) {
                            t.text = _.omit(t.text, function(v,k) {
                                return ~k.indexOf('*');
                            });
                            return t;
                        });
                    }

                    $scope.currentQuestion = question;
                    $scope.countriesTexts  = countriesTexts;
                    $scope.textsDialogVisible = !_.isEmpty(countriesTexts);
                };

                //====================================
                //
                //
                //====================================
                nrAnalyzer.toggleSection = function(sectionName, expanded) {

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

                    return nrAnalyzer.loadReports({

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
                nrAnalyzer.filter = function(filter) {

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
                nrAnalyzer.loadReports = function(options) {

                    options = _.defaults(options||{}, {
                        reportType : $scope.selectedReportType,
                        regions : $scope.selectedRegions,
                        maxDate : $scope.maxDate,
                        questions : []
                    });

                    var query  = { 'government_REL' : { $in: options.regions } };
                    var fields = _(options.questions).union(['government']).reduce(function(ret, key) {
                        ret[key] = 1;
                        return ret;
                    }, {});

                    if(options.maxDate) {
                        query.date = { $lt : { $date :  options.maxDate } };
                    }

                    var collectionUrls = {
                        cpbNationalReport2 : "/api/v2015/national-reports-cpb-2",
                        cpbNationalReport3 : "/api/v2015/national-reports-cpb-3"
                    };

                    return $http.get(collectionUrls[options.reportType], {  params: { q : query, f : fields }, cache : true }).then(function(res) {
                        return _.map(res.data, function(report) {
                            report.government = nrAnalyzer.normalizeAnswer(report.government);
                            return report;
                        });
                    });
                };

                //==============================================
                //
                //
                //==============================================
                nrAnalyzer.normalizeAnswer = function (v) {

                    if(_.isArray(v))
                        return _(v).map(nrAnalyzer.normalizeAnswer).compact().value();

                    v = v && (v.value || v.identifier || v);

                    if(typeof(v)=='boolean')
                        v = v.toString();

                    return v;
                };

            }]
        };
    }]);
});
