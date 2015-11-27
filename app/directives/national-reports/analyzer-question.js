define(['text!./analyzer-question.html', 'app', 'lodash', 'ngSanitize'], function(templateHtml, app, _) {

    var GREEN = { R:167, G:201, B: 27 };
    var BLUE  = { R: 70, G:163, B:230 };
    var WHITE = { R:255, G:255, B:255 };

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
                sumType : '='
            },
            link: function ($scope, el, attr, nrAnalyzer) {

                analyze();

                $scope.$on('nr.analyzer.filter', analyze);

                //==============================================
                //
                //
                //==============================================
                $scope.showSumTypeSelector = function() {
                    nrAnalyzer.showSumTypeSelector(true);
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
                function analyze() {

                    if(!$scope.reports) return;
                    if(!$scope.regions) return;
                    if(!$scope.question) return;

                    $scope.reportsMap = {};
                    $scope.filter     = nrAnalyzer.filter();

                    var filter = $scope.filter;
                    var reports = $scope.reports;
                    var regions  = $scope.regions;
                    var question = $scope.question;
                    var options  = $scope.question.options;
                    var reportsMap = $scope.reportsMap;
                    var optionsMap = {};

                    if(question.type=='text') {
                        options = [{ value: 'text' }];  // text responses don't have predefine values; Simulate a fake one
                        $scope.question.options = options;
                    }

                    options.forEach(function(option, i) {

                        optionsMap[option.value] = option;

                        option.sum = 0;
                        option.fullSum = 0;
                        option.percent = "0%";
                        option.regions = {};
                        option.color = question.type=='option' ? blendColor(GREEN, BLUE, i/(options.length-1)) : BLUE;
                        option.htmlColor = htmlColor(option.color);
                        option.filterOn  = filter && filter.question.key == question.key && filter.option.value == option.value;
                        option.regions   = _(regions).reduce(function(ret, region){
                            ret[region.identifier] = {
                                sum : 0,
                                percentRow: "0%",
                                percentColumn: "0%",
                                percentGlobal: "0%",
                                htmlColor: htmlColor(WHITE)
                            };
                            return ret;
                        }, {});
                    });

                    question.sum = 0;
                    question.fullSum = 0;
                    question.regions = _(regions).reduce(function(ret, region){
                        ret[region.identifier] = { sum : 0 };
                        return ret;
                    }, {});

                    reports.forEach(function(report) {

                        var included = !filter || !!filter.matchingCountriesMap[report.government];
                        var answers  = report[question.key];

                        if(included)
                            reportsMap[report.government] = report;


                        if(_.isEmpty(answers))
                            answers = undefined;

                        if(question.type=='text' && !!answers)
                            answers = 'text';

                        answers = _([answers]).flatten().compact().value();

                        answers.forEach(function(value){

                            var option = optionsMap[value.toString()];

                            if(!option) {
                                return;
                            }

                            question.fullSum++;
                            option  .fullSum++;

                            if(included) {
                                question.sum++;
                                option  .sum++;
                                option.percent = Math.round((option.sum*100) / question.sum).toString() + "%";
                            }

                            regions.forEach(function(region){

                                var qRegion = question.regions[region.identifier];
                                var oRegion = option  .regions[region.identifier];

                                if(included && region.countriesMap[report.government]) {
                                    qRegion.sum++; // column
                                    oRegion.sum++; // column
                                }

                                var percentRow = option.sum ? Math.round((oRegion.sum*100) / option.sum) : 0;

                                oRegion.percentRow    = option.sum   ? percentRow + "%" : '-';
                                oRegion.percentColumn = qRegion.sum  ? Math.round((oRegion.sum*100) / qRegion.sum ).toString() + "%" : '-';
                                oRegion.percentGlobal = question.sum ? Math.round((oRegion.sum*100) / question.sum).toString() + "%" : '-';
                                oRegion.htmlColor     = htmlColor(blendColor(WHITE, option.color, percentRow/100));

                            });
                        });
                    });
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
