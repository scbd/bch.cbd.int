define(['text!./analyzer.html', 'app', 'lodash', 'require', 'jquery', './analyzer-question', 'directives/infinit-scroll', 'filters/lstring'],
        function(templateHtml, app, _, require, $) { 'use strict';

    var baseUrl = require.toUrl('');

    //==============================================
    //
    //
    //==============================================
    app.directive('nationalReportAnalyzer', ['$http', '$q', 'locale', '$filter', function($http, $q, locale, $filter) {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            scope :  {
                selectedRegions: '=regions',
                selectedQuestions: '=questions',
                selectedReportType: '=reportType'
            },
            controller : ['$scope', function($scope){

                var sumTypes = ['sum', 'percentRow', 'percentColumn', 'percentGlobal'];

                this.selectSumType = function() {

                    $scope.sumType = sumTypes.pop();

                    sumTypes.unshift($scope.sumType);
                };
            }],
            link: function ($scope) {

                $scope.limit = 0;
                $scope.sumType = 'sum';

                //====================================
                //
                //
                //====================================
                $scope.$watch('selectedRegions',    load);
                $scope.$watch('selectedQuestions',  load);
                $scope.$watch('selectedReportType', load);

                //====================================
                //
                //
                //====================================
                function load() {

                    if(!$scope.selectedRegions)    return;
                    if(!$scope.selectedQuestions)  return;
                    if(!$scope.selectedReportType) return;

                    $scope.limit = 0;
                    $scope.infinitScrollVisible = true;

                    $q.all([loadRegions(), loadSections(), loadReports()]).then(function(results) {

                        var regions  = results[0];
                        var sections = results[1];
                        var reports  = results[2];

                        regions = _.map(regions, function(term){

                            var regionReports = _.filter(reports, function(report){
                                return report.regions[term.identifier];
                            });

                            return {
                                identifier: term.identifier,
                                title: term.title,
                                shortTitle: term.shortTitle,
                                htmlTitle : htmlTitle(term.shortTitle, term.title),
                                reports: toMap(regionReports, 'government')
                            };
                        });

                        $scope.regions = regions;
                        $scope.reports = reports;
                        $scope.sections = sections;

                        $scope.limit = 0;
                        $scope.infinitScrollVisible = true;

                        $scope.nextPage(10);
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

                    var regions = $http.get('/api/v2013/thesaurus/domains/regions/terms', { cache : true }).then(function(res) {
                        return res.data;
                    });

                    return $q.all([countries, regions]).then(function(results){

                        var selection = toMap($scope.selectedRegions);

                        return _(results).flatten().filter(function (term) {
                            return selection[term.identifier];
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

                    var reportType = $scope.selectedReportType;

                    return $http.get(baseUrl+'resources/national-reports/'+locale+'/'+reportType+'.json', { cache : true }).then(function(res) {

                        var selection = toMap($scope.selectedQuestions);

                        return _.filter(res.data, function(section) {

                            section.limit = 0;
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
                function loadReports(options) {

                    options = _.defaults(options||{}, {
                        reportType : $scope.selectedReportType,
                    });

                    var query  = { 'government_REL' : { $in: $scope.selectedRegions } };
                    var fields = {
                        contact: 0,
                        participatingOrganizations: 0
                    };

                    var collectionUrls = {
                        cpbNationalReport2 : "/api/v2015/national-reports-cpb-2",
                        cpbNationalReport3 : "/api/v2015/national-reports-cpb-3"
                    };

                    return $http.get(collectionUrls[options.reportType], {  params: { q : query, f : fields }, cache : true }).then(function(res) {

                        return _.map(res.data, function(report) {

                            report.regions = toMap(report.government_REL);

                            return _.mapValues(report, toRawValue);
                        });
                    });

                    function toRawValue(v) {

                        if(_.isArray(v))
                        return _.map(v, toRawValue);

                        return v.value || v.identifier || v;
                    }
                }

                //====================================
                //
                //
                //====================================
                function toMap(values, key) {

                    return _.reduce(values, function(map, v) {

                        if(key) map[v[key]] = v;
                        else    map[v]      = v;

                        return  map;

                    }, {});
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

                //====================================
                //
                //
                //====================================
                $scope.nextPage = function(increment) {

                    var sections = $scope.sections;

                    if(!sections)
                    return;

                    increment = Math.max(increment || 1, 0);

                    for(var s = Math.max($scope.limit-1, 0);  s < sections.length && increment>0; ++s) {

                        $scope.limit = Math.max(s+1 , $scope.limit);

                        var section = sections[s];
                        var delta = Math.min(section.questions.length - section.limit, increment);

                        section.limit += delta;
                        increment     -= delta;
                    }

                    var lastSection = _.last(sections);

                    $scope.infinitScrollVisible = $scope     .limit != sections.length ||
                    lastSection.limit != lastSection.questions.length;
                };
            }
        };
    }]);
});
