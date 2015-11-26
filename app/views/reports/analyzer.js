define(['directives/national-reports/questions-selector', 'directives/national-reports/analyzer'], function() { 'use strict';

	return ['$scope', function($scope) {

        $scope.showSettings = true;

        try {

            var data = JSON.parse(sessionStorage.getItem('nrAnalyzerData') || '{}');

            $scope.selectedReportType = data.reportType;
            $scope.selectedQuestions  = data.questions;
            $scope.selectedRegions    = data.regions;

            if($scope.selectedReportType && $scope.selectedQuestions && $scope.selectedRegions)
                $scope.showSettings = false;

        } finally {
            sessionStorage.removeItem('nrAnalyzerData');
        }

        //========================================
        //
        //
        //========================================
        $scope.analyze = function(showAnalyser) {

            if(showAnalyser===undefined)
                showAnalyser = true;

            $scope.showSettings = !showAnalyser;
        };
    }];
});
