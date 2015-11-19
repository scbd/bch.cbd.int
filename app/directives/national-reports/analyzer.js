define(['text!./analyzer.html', 'app', 'lodash', 'require', 'jquery', './analyzer-section', 'filters/lstring'],
        function(templateHtml, app, _, require, $) { 'use strict';

    var baseUrl = require.toUrl('');

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
                selectedRegions: '=regions',
                selectedQuestions: '=questions',
                selectedReportType: '=reportType'
            },
            link: function ($scope, el, attr, nrAnalyzer) {

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

                    $q.all([loadRegions(), loadSections(), nrAnalyzer.loadReports()]).then(function(results) {

                        var regions  = results[0];
                        var sections = results[1];
                        var reports  = results[2];

                        regions = _.map(regions, function(term){

                            var countries = _(reports).filter(function(report){

                                return report.regions[term.identifier];

                            }).sortBy('government').reduce(function(ret, report) {

                                ret[report.government] = report.government;
                                return ret;

                            }, {});

                            return {
                                identifier: term.identifier,
                                title: term.title,
                                shortTitle: term.shortTitle,
                                htmlTitle : htmlTitle(term.shortTitle, term.title),
                                countries: countries
                            };
                        });

                        $scope.regions = regions;
                        $scope.sections = sections;

                    }).then(function(){

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
            },

            controller : ['$scope', function($scope){

                var _self = this;

                var sumTypes = ['sum', 'percentRow', 'percentColumn', 'percentGlobal'];

                this.selectSumType = function() {

                    $scope.sumType = sumTypes.pop();

                    sumTypes.unshift($scope.sumType);
                };

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

                        questions : _.pluck(section.questions, 'key')

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
                this.loadReports = function(options) {

                    options = _.defaults(options||{}, {
                        reportType : $scope.selectedReportType,
                        regions : $scope.selectedRegions,
                        questions : []
                    });

                    var query  = { 'government_REL' : { $in: options.regions } };
                    var fields = _(options.questions).union(['documentId', 'government', 'government_REL']).reduce(function(ret, key) {
                        ret[key] = 1;
                        return ret;
                    }, {});

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
