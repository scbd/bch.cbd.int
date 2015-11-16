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
                regions : '='
            },
            link: function ($scope) {
            }
        };
    }]);
});
