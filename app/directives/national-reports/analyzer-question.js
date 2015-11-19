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

                $scope.$watch('::question', analyze);
                $scope.$watch('::reports',  analyze);
                $scope.$watch('::regions',  analyze);

                //==============================================
                //
                //
                //==============================================
                $scope.selectSumType = function() {
                    nrAnalyzer.selectSumType();
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

                    var reports  = $scope.reports;
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

                        option.sum = 0;
                        option.percent = 0;
                        option.regions = {};
                        option.color = question.type=='option' ? blendColor(GREEN, BLUE, i/(options.length-1)) : BLUE;

                        option.htmlColor = htmlColor(option.color);

                        optionsMap[option.value] = option;
                    });

                    question.sum = 0;
                    question.regions = {};

                    reports.forEach(function(report) {

                        reportsMap[report.government] = report;

                        var answers = report[question.key];

                        if(_.isEmpty(answers))
                            answers = undefined;

                        if(question.type=='text' && !!answers) {
                            answers = 'text';
                        }

                        answers = _([answers]).flatten().compact().value();

                        answers.forEach(function(value){

                            var option = optionsMap[value.toString()];

                            if(!option) {
                                return;
                            }

                            question.sum++;
                            option  .sum++;
                            option  .percent = Math.round((option.sum*100) / question.sum);

                            regions.forEach(function(region){


                                var qRegion = question.regions[region.identifier] || (question.regions[region.identifier] = { sum : 0 });
                                var oRegion = option  .regions[region.identifier] || (option  .regions[region.identifier] = { sum : 0, percentRow: 0, percentColumn: 0, percentGlobal: 0 });

                                if(region.countries[report.government]) {
                                    qRegion.sum++; // column
                                    oRegion.sum++; // column
                                }

                                oRegion.percentRow    = Math.round((oRegion.sum*100) / option.sum);
                                oRegion.percentColumn = Math.round((oRegion.sum*100) / qRegion.sum);
                                oRegion.percentGlobal = Math.round((oRegion.sum*100) / question.sum);
                                oRegion.htmlColor     = htmlColor(blendColor(WHITE, option.color, oRegion.percentRow/100));
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
