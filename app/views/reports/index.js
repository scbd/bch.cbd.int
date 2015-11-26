define(['directives/national-reports/questions-selector'], function() { 'use strict';

	return ['$scope', '$location', function($scope, $location) {


        $scope.analyze = function() {

            var data = {
                reportType : $scope.selectedReportType,
                questions : $scope.selectedQuestions,
                regions : $scope.selectedRegions
            };

            sessionStorage.setItem('nrAnalyzerData', JSON.stringify(data));

            $location.url('/analyzer');
        };

	}];
});
