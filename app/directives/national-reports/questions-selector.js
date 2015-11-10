define(['text!./questions-selector.html', 'app', 'lodash', "require"], function(templateHtml, app, _, require) {

    var baseUrl = require.toUrl('');

	//==============================================
	//
	//
	//==============================================
	app.directive('nationalReportQuestionsSelector', ["$http", function($http) {
		return {
			restrict : "E",
			replace : true,
			template : templateHtml,
			scope :  {
			},
			link: function ($scope) {

                $scope.emitSelection      = emitSelection;
                $scope.broadcastSelection = broadcastSelection;
                $scope.reportType         = "cpbNationalReport3";

                $scope.$watch("reportType", loadQuestions);

                //====================================
                //
                //
                //====================================
                function loadQuestions(reportType) {

                    $http.get(baseUrl+"resources/national-reports/en/"+reportType+".json").then(function(res){
                        $scope.sections = res.data;
                    });
                }

                //====================================
                //
                //
                //====================================
                function emitSelection(question) {

                    var section = _.findWhere($scope.sections, { section : question.section });

                    section.selected = true;

                    section.questions.forEach(function(q){
                        section.selected = section.selected && q.selected;
                    });
                }

                //====================================
                //
                //
                //====================================
                function broadcastSelection(section) {

                    section.questions.forEach(function(q){
                        q.selected = section.selected
                    });
                }
			}
		};
	}]);
});
