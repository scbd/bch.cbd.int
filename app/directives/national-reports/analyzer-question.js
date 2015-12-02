define(['text!./analyzer-question.html', 'app', 'lodash', 'ngSanitize'], function(templateHtml, app, _) {

    var WHITE      = { R:255, G:255, B:255 };
    var SHADE_BASE = { R: 70, G:163, B:230 };

    //==============================================
    //
    //
    //==============================================
    app.directive('nationalReportAnalyzerQuestion', [function() {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            require : '^nationalReportAnalyzer',
            scope :  {
                question : '=',
                reports : '=',
                regions : '=',
                sumType : '=',
                previousQuestionsMapping : '='
            },
            link: function ($scope, el, attr, nrAnalyzer) {

                initTooltips();

                $scope.$on('nr.analyzer.filter', analyze);

                analyze();

                //==============================================
                //
                //
                //==============================================
                $scope.$watch('::previousQuestionsMapping', initTooltips);

                function initTooltips() {
                    el.find('[data-toggle="popover"]:not([data-original-title])').popover({trigger:'hover focus'});
                }

                //==============================================
                //
                //
                //==============================================
                $scope.testAnswer = function(answer, value) {

                    if(answer === value)     return true;
                    if(answer === undefined) return false;
                    if(_.isArray  (answer))  return answer.indexOf(value)>=0;
                    if(_.isBoolean(answer))  return value == (answer ? 'true' : 'false');

                    return false;
                };

                //==============================================
                //
                //
                //==============================================
                $scope.showTexts = function(governments) {

                    if(!governments)
                        governments = _.pluck($scope.reports, 'government');

                    var filter = nrAnalyzer.filter();

                    var results = _($scope.reports).filter(function(report) {

                        return governments.indexOf(report.government)>=0;

                    }).filter(function(report) {

                        return !_.isEmpty(report[$scope.question.key]);

                    }).filter(function(report) {

                        return !filter || filter.matchingCountriesMap[report.government];

                    }).map(function(report) {

                        return {
                            government : report.government,
                            text : report[$scope.question.key]
                        };

                    }).value();

                    nrAnalyzer.showTexts(results, $scope.question);
                };

                //==============================================
                //
                //
                //==============================================
                $scope.toggleFilter = function(option) {

                    var question = $scope.question;
                    var oldFilter = nrAnalyzer.filter();

                    if(!option || (oldFilter && oldFilter.question.key == question.key && oldFilter.option.value == option.value)) {
                        nrAnalyzer.filter(undefined);
                        return;
                    }

                    var countriesMap = _($scope.reports).filter(function(report) {

                        var answer = report[question.key];

                        return answer && (answer == option.value || answer.indexOf(option.value)>=0);

                    }).reduce(function(ret, report){

                        ret[report.government] = report.government;
                        return ret;

                    }, {});

                    nrAnalyzer.filter({
                        question : question,
                        option : option,
                        matchingCountriesMap : countriesMap
                    });
                };

                //==============================================
                //
                //
                //==============================================
                $scope.toggleCompare = function() {

                    if($scope.previousReportsMap) {

                        $scope.previousReportsMap = null;
                        analyze();

                        return;
                    }

                    var reports = $scope.reports;
                    var question = $scope.question;
                    var previousQuestionsMapping = $scope.previousQuestionsMapping;

                    if(!previousQuestionsMapping)
                        return;

                    var data = {
                        reportType : previousQuestionsMapping.schema,
                        regions : _.pluck(reports, 'government'),
                        questions : [previousQuestionsMapping[question.key]]
                    };

                    return nrAnalyzer.loadReports(data).then(function(previousReports) {

                        return ($scope.previousReportsMap = _(previousReports).reduce(function(ret, report){

                            ret[report.government] = report;
                            return ret;

                        },{}));

                    }).then(analyze);
                };

                //==============================================
                //
                //
                //==============================================
                $scope.cleanupQuestionNumber = function(q) {
                    return (q||'').replace(/^Q0*/, '');
                };

                //==============================================
                //
                //
                //==============================================
                $scope.$watch("::regions", function(regions) {

                    $scope.regionsMap = _(regions).reduce(function(regionsMap, region){

                        regionsMap[region.identifier] = region;

                        return regionsMap;

                    },{});
                });

                //==============================================
                //
                //
                //==============================================
                function analyze() {

                    if(!$scope.reports) return;
                    if(!$scope.regions) return;
                    if(!$scope.question) return;

                    if($scope.question.type=='text') {
                        $scope.question.options = [{ value: 'text' }];  // text responses don't have predefine values; Simulate a fake one
                    }

                    var data = analyzeReports($scope.reports);

                    $scope.filter     = nrAnalyzer.filter();
                    $scope.reportsMap = data.reports;
                    $scope.fullSum    = data.fullSum;
                    $scope.rows       = _.values(data.rows);
                }

                //============================================================
                //
                //
                //============================================================
                function analyzeReports(reports) {

                    var question = $scope.question;
                    var regions  = $scope.regions;
                    var filter   = nrAnalyzer.filter();

                    var data = {
                        sum : 0,
                        fullSum : 0,
                        reports : {}
                    };

                    data.columns = _(regions).reduce(function(columns, r){

                        columns[r.identifier] = {
                            identifier : r.identifier,
                            sum : 0
                        };

                        return columns;

                    }, {});

                    data.rows = _(question.options).reduce(function (rows, option) {

                        rows[option.value] = _.assign({}, option, {
                            sum : 0,
                            fullSum : 0,
                            filterOn : filter && filter.question.key == question.key && filter.option.value == option.value,
                            cells : _(regions).reduce(function(cells, r){
                                cells[r.identifier] = {
                                    identifier : r.identifier,
                                    sum : 0
                                };
                                return cells;
                            }, {})
                        });

                        return rows;

                    }, {});

                    reports.forEach(function(report) {

                        var included = !filter || !!filter.matchingCountriesMap[report.government];

                        if(included)
                            data.reports[report.government] = report;

                        var answers      = getNormalizeAnswers(report);
                        var answeredRows = _(answers).map(function(value) { return data.rows[value]; }).compact().value();

                        answeredRows.forEach(function(row){

                            data.fullSum++;
                            row .fullSum++;

                            if(included) {
                                data.sum++;
                                row .sum++;
                            }

                            regions.forEach(function(region){

                                var column = data.columns[region.identifier];
                                var cell   = row .cells  [region.identifier];

                                if(included && region.countriesMap[report.government]) {
                                    column.sum++; // column
                                    cell  .sum++; // column
                                }
                            });
                        });
                    });

                    _.forEach(data.columns, function(column, identifier){

                        _.values(data.rows).forEach(function(row) {

                            var cell = row.cells[identifier];

                            row .percent       = data  .sum ? Math.round((row .sum*100) / data.sum)   : 0;
                            cell.percentGlobal = data  .sum ? Math.round((cell.sum*100) / data.sum)   : 0;
                            cell.percentColumn = column.sum ? Math.round((cell.sum*100) / column.sum) : 0;
                            cell.percentRow    = row   .sum ? Math.round((cell.sum*100) / row.sum)    : 0;

                            cell.backgroundColor = {
                                sum           : htmlColor(blendColor(WHITE, SHADE_BASE, cell.percentGlobal/100)),
                                percentGlobal : htmlColor(blendColor(WHITE, SHADE_BASE, cell.percentGlobal/100)),
                                percentColumn : htmlColor(blendColor(WHITE, SHADE_BASE, cell.percentColumn/100)),
                                percentRow    : htmlColor(blendColor(WHITE, SHADE_BASE, cell.percentRow   /100))
                            };

                            cell.textColor = {
                                sum           : cell.percentGlobal < 75 ? 'inherit' : 'white',
                                percentGlobal : cell.percentGlobal < 75 ? 'inherit' : 'white',
                                percentColumn : cell.percentColumn < 75 ? 'inherit' : 'white',
                                percentRow    : cell.percentRow    < 75 ? 'inherit' : 'white'
                            };
                        });
                    });

                    return data;
                }

                //============================================================
                //
                //
                //============================================================
                function getNormalizeAnswers(report) {

                    var answers = report[$scope.question.key];

                    if(_.isEmpty(answers))
                        answers = undefined;

                    if($scope.question.type=='text' && !!answers)
                        answers = 'text';

                    return _([answers]).flatten().compact().value();
                }

                //============================================================
                //
                //
                //============================================================
                function blendColor(colorA, colorB, ratio) {
                    return {
                        R : colorA.R + Math.floor((colorB.R-colorA.R) * ratio),
                        G : colorA.G + Math.floor((colorB.G-colorA.G) * ratio),
                        B : colorA.B + Math.floor((colorB.B-colorA.B) * ratio)
                    };
                }

                //============================================================
                //
                //
                //============================================================
                function htmlColor(color) {

                    var RR = color.R.toString(16);
                    var GG = color.G.toString(16);
                    var BB = color.B.toString(16);

                    if(RR.length<2) RR = '0'+RR;
                    if(GG.length<2) GG = '0'+GG;
                    if(BB.length<2) BB = '0'+BB;

                    return '#'+RR+GG+BB;
                }
            }
        };
    }]);
});
