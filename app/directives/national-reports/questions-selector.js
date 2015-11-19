define(['text!./questions-selector.html', 'app', 'lodash', 'require', 'directives/selectors/terms-dialog', 'directives/intermediate'], function(templateHtml, app, _, require) {

    var baseUrl = require.toUrl('');

    var DefaultRegions = [
        "D50FE62D-8A5E-4407-83F8-AFCAAF708EA4", // CBD Regional Groups - Africa
        "5E5B7AA4-2420-4147-825B-0820F7EC5A4B", // CBD Regional Groups - Asia and the Pacific
        "942E40CA-4C23-4D3A-A0B4-736CD0EFCD54", // CBD Regional Groups - Central and Eastern Europe
        "3D0CCC9A-A0A1-4399-8FA2-41D4D649DB0E", // CBD Regional Groups - Latin America and the Caribbean
        "0EC2E5AE-25F3-4D3A-B71F-8019BB62ED4B"  // CBD Regional Groups - Western Europe and Others
    ];


    //==============================================
    //
    //
    //==============================================
    app.directive('nationalReportQuestionsSelector', ['$http', 'locale', function($http, locale) {
        return {
            restrict : 'E',
            replace : true,
            template : templateHtml,
            scope :  {
                selectedReportType : '=reportType',
                selectedQuestions : '=questions',
                selectedRegions : '=regions'
            },
            link: function ($scope) {

                $scope.selectedReportType = 'cpbNationalReport3';
                $scope.countriesPreset = "cbdRegions";
                $scope.allSelected = true;
                $scope.countriesMap = {};

                //====================================
                //
                //
                //====================================
                $scope.$watch('selectedReportType', function (reportType) {

                    if(!reportType)
                        return;

                    $http.get(baseUrl+'resources/national-reports/'+locale+'/'+reportType+'.json', { cache : true }).then(function(res){

                        $scope.sections = res.data;
                        $scope.allSelected = true;
                        $scope.onAllSections();

                    });
                });

                //====================================
                //
                //
                //====================================
                $scope.$watch('countriesPreset', function (preset) {
                    if(preset=="cbdRegions") { $scope.selectedRegions = DefaultRegions.concat(); }
                    if(preset=="countries")  { $scope.selectedRegions = []; $scope.showCountries = true; }
                    if(preset=="regions")    { $scope.selectedRegions = []; $scope.showRegions = true; }
                });

                //====================================
                //
                //
                //====================================
                $scope.removeRegions = function(country){

                    var index = $scope.selectedRegions.indexOf(country);

                    if(index>=0)
                        $scope.selectedRegions.splice(index,1);
                };

                //====================================
                //
                //
                //====================================
                $scope.onQuestion = applyIntermediateState;

                //====================================
                //
                //
                //====================================
                $scope.onSection = function(section, applyIntermediate) {

                    section.questions.forEach(function(question){
                        question.selected = section.selected;
                    });

                    if(applyIntermediate || applyIntermediate===undefined)
                    applyIntermediateState();
                };

                //====================================
                //
                //
                //====================================
                $scope.onAllSections = function() {

                    if(!$scope.sections)
                    return;

                    $scope.sections.forEach(function(section){
                        section.selected = $scope.allSelected;
                        $scope.onSection(section, false);
                    });

                    applyIntermediateState();
                };

                //====================================
                //
                //
                //====================================
                function applyIntermediateState() {

                    if(!$scope.sections)
                    return;

                    var on  = 0;
                    var off = 0;
                    var int = 0;

                    $scope.sections.forEach(function(section){
                        section.selected = getIntermediateState(section.questions);

                        if(section.selected===null ) ++int;
                        if(section.selected===true ) ++on;
                        if(section.selected===false) ++off;
                    });

                    if((on && off) || int) $scope.allSelected = null;
                    else                   $scope.allSelected = !!on;

                    $scope.selectedQuestions = [];

                    $scope.sections.forEach(function(section){
                        section.questions.forEach(function(question){
                            if(question.selected)
                            $scope.selectedQuestions.push(question.key);
                        });
                    });

                }

                //====================================
                //
                //
                //====================================
                function getIntermediateState(items) {

                    var on  = 0;
                    var off = 0;

                    items.forEach(function(e) {
                        if(e.selected) ++on;
                        else           ++off;
                    });

                    return (on && off) ? null : !!on;
                }

                //====================================
                //
                //
                //====================================
                $scope.getCountries = function() {

                    return $http.get("/api/v2013/thesaurus/domains/countries/terms", { cache : true }).then(function (res) {
                        mapTerms(res.data);
                        return res.data;
                    });
                };

                //====================================
                //
                //
                //====================================
                $scope.getRegions = function() {

                    return $http.get("/api/v2013/thesaurus/domains/regions/terms", { cache : true }).then(function (res) {
                        mapTerms(res.data);
                        return res.data;
                    });
                };

                $scope.getRegions();

                //====================================
                //
                //
                //====================================
                function mapTerms(terms) {

                    if(!$scope.countriesMap[terms[0].identifier]) {
                        terms.forEach(function(t){
                            $scope.countriesMap[t.identifier] = t;
                        });
                    }
                }
            }
        };
    }]);
});
