define(['text!./analyzer-question.html', 'app', 'lodash'], function(templateHtml, app, _, require) {

    //==============================================
    //
    //
    //==============================================
    app.directive('nationalReportAnaylzerQuestion', [function() {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            scope :  {
                question : '=',
                reports : '=',
                regions : '=',
                sumType : '='
            },
            link: function ($scope) {

                $scope.$watch('::question', analyze);
                $scope.$watch('::reports',  analyze);
                $scope.$watch('::regions',  analyze);

                function analyze() {

                    if(!$scope.reports) return;
                    if(!$scope.regions) return;
                    if(!$scope.question) return;

                    var reports  = $scope.reports;
                    var regions  = $scope.regions;
                    var question = $scope.question;
                    var optionsMap = _.reduce(question.values, function(map, opt) {

                        opt.sum = 0;
                        opt.percent = 0;
                        opt.regions = {};

                        map[opt.value] = opt;

                        return map;
                    }, {});

                    question.sum = 0;
                    question.regions = {};

                    reports.forEach(function(report){

                        var responses = _([report[question.key]]).flatten().compact().value();

                        responses.forEach(function(value){

                            var option = optionsMap[value.toString()];

                            if(!option) {
                                return;
                            }

                            question.sum++; // global
                            option  .sum++; // row
                            option  .percent = Math.round((option.sum*100) / question.sum);

                            regions.forEach(function(region){

                                if(!region.reports[report.government])
                                    return;

                                var qRegion = question.regions[region.identifier] || (question.regions[region.identifier] = { sum : 0 });
                                var oRegion = option  .regions[region.identifier] || (option  .regions[region.identifier] = { sum : 0, percentRow: 0, percentColumn: 0, percentGlobal: 0 });

                                qRegion.sum++; // column
                                oRegion.sum++; // column

                                oRegion.percentRow    = Math.round((oRegion.sum*100) / option.sum);
                                oRegion.percentColumn = Math.round((oRegion.sum*100) / qRegion.sum);
                                oRegion.percentGlobal = Math.round((oRegion.sum*100) / question.sum);
                            });
                        });
                    });
                }

                var sumTypes = [
                    'percentColumn',
                    'percentRow',
                    'percentGlobal',
                    'sum'
                ];

                $scope.setSumType = function() {
                    $scope.sumType = sumTypes.shift();
                    sumTypes.push($scope.sumType);
                };
            }
        };
    }]);
});
