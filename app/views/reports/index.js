define(['directives/national-reports/questions-selector'], function() {
    'use strict';

    return ['$scope', '$location', function($scope, $location) {

        //========================================
        //
        //
        //========================================
        $scope.analyze = function() {

            var data = {
                type: $scope.selectedReportType,
                regions: $scope.selectedRegions,
                questions: $scope.selectedQuestions
            };

            sessionStorage.setItem('nrAnalyzerData', JSON.stringify(data));

            $location.url($location.path() + '/analyzer');
        };

    }];
});
