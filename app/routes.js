define(['app', 'jquery', 'lodash', 'providers/extended-route'], function(app, $, _) { 'use strict';

	app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		var baseHref = $("base").attr('href').toLowerCase();

		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		//CONDITIONAL ROUTES

        if(baseHref == '/database/lmo/') {

            $routeProvider.when('/decisions.shtml',  { templateUrl: 'views/lmos/decisions-lmo-id.html', resolveController: true});

		}
        else if(baseHref == '/database/reports/') {

            $routeProvider.when('/',          { templateUrl: 'views/reports/index.html',    resolveController: true});
            $routeProvider.when('/analyzer',  { templateUrl: 'views/reports/analyzer.html', resolveController: true});

		}
		else {
			throw "Unhandled base:" + baseHref;
		}
	}]);
});
