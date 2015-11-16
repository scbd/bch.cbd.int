define(['text!./analyzer.html', 'app', 'lodash', 'require', './analyzer-question' ,'directives/infinit-scroll'], function(templateHtml, app, _, require) {

    var baseUrl = require.toUrl('');

    //==============================================
    //
    //
    //==============================================
    app.directive('nationalReportAnaylzer', ['$http', '$q', 'locale', function($http, $q, locale) {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            scope :  {
                reportType : '=',
                questions : '=',
                governments : '='
            },
            link: function ($scope) {

                $scope.limit = 0;

                //====================================
                //
                //
                //====================================
                $scope.$watch('questions', load);
                $scope.$watch('reportType', load);
                $scope.$watch('governments', load);

                //====================================
                //
                //
                //====================================
                function load() {

                    if(!$scope.reportType) return;
                    if(!$scope.questions)  return;
                    if(!$scope.governments) return;

                    $q.all([loadRegions(), loadSections(), loadReports().then(function(reports){

                        $scope.reports = reports;

                    })]).then(function(){
                        computeData();
                    });
                }

                //====================================
                //
                //
                //====================================
                function loadRegions() {

                    var results = _.map($scope.governments, function(id) {
                        return $http.get('/api/v2013/thesaurus/terms/'+id, { cache : true }).then(function(res) {
                            return res.data;
                        });
                    });

                    $q.all(results).then(function(terms){

                        $scope.regions = _.map(terms, function(term){

                            var allMembers = toMap(term.narrowerTerms);

                            allMembers[term.identifier] = term.identifier; //include self

                            return {
                                identifier : term.identifier,
                                title : term.title,
                                shortTitle : term.shortTitle,
                                allMembers : allMembers,
                                members : []
                            };
                        });
                    });
                }


                //====================================
                //
                //
                //====================================
                function loadSections() {

                    $scope.limit = 0;

                    var reportType = $scope.reportType;
                    var selectedQuestions = toMap($scope.questions);

                    return $http.get(baseUrl+'resources/national-reports/'+locale+'/'+reportType+'.json', { cache : true }).then(function(res) {

                        $scope.sections = _.filter(res.data, function(section) {

                            section.limit = 0;
                            section.questions = _.filter(section.questions, function(q) {
                                return selectedQuestions[q.key];
                            });

                            return !!section.questions.length;
                        });

                        $scope.limit = 0;
                        $scope.infinitScrollVisible = true;

                        return $scope.sections;
                    });
                }

                //====================================
                //
                //
                //====================================
                function loadReports(options) {

                    options = _.defaults(options||{}, {
                        reportType : $scope.reportType,
                        questions : $scope.questions
                    });

                    var query  = { 'government_REL' : { $in: $scope.governments } };
                    var fields = { contact: 0, participatingOrganizations:0 };

                    var collectionUrls = {
                        cpbNationalReport2 : "/api/v2015/national-reports-cpb-2",
                        cpbNationalReport3 : "/api/v2015/national-reports-cpb-3"
                    };

                    return $http.get(collectionUrls[options.reportType], {  params: { q : query, f : fields }, cache : true }).then(function(res) {
                        return res.data;
                    });
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
                function computeData() {

                    var questions = _($scope.sections).pluck('questions').flatten().value();
                    var reports   = $scope.reports;
                    var regions   = $scope.regions;

                    questions.forEach(function(question){

                        if(question.type=='option'){

                            question.values.forEach(function (option) {

                                option.all = 0;

                                reports.forEach(function(report){

                                    var value = report[question.key];

                                    if(value===undefined)
                                        return;

                                    value = value.value || value;

                                    if(value.toString()==option.value){
                                        option.all++;

                                        regions.forEach(function(region){
                                            option[region.identifier] = option[region.identifier] || 0;

                                            if(region.allMembers[report.government.identifier])
                                                option[region.identifier]++;
                                        })
                                    }
                                });
                            });
                        }
                    });
                }


                //====================================
                //
                //
                //====================================
                $scope.nextPage = function(increment) {

                    var sections = $scope.sections;

                    increment = Math.max(increment || 1, 0);

                    if(!sections)
                        return;

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
