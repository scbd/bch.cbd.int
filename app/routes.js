define(['app', 'lodash', 'providers/extended-route'], function(app, _) { 'use strict';

	app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$locationProvider.html5Mode({ enabled : true, requireBase: false });
		$locationProvider.hashPrefix('!');

		//CONDITIONAL ROUTES

        $routeProvider.when('/database/lmo/decisions.shtml', { templateUrl: 'views/lmos/decisions-lmo-id.html', resolveController: true});
        $routeProvider.when('/database/reports/',            { templateUrl: 'views/reports/index.html',         resolveController: true});
        $routeProvider.when('/database/reports/analyzer',    { templateUrl: 'views/reports/analyzer.html',      resolveController: true});

        //FOR DEV TO BE DELETED
        $routeProvider.when('/database/reportsx/',           { templateUrl: 'views/reports/index.html',         resolveController: true});
        $routeProvider.when('/database/reportsx/analyzer',   { templateUrl: 'views/reports/analyzer.html',      resolveController: true});

	}]);

    // Reload  page when no target route
    app.run(['$rootScope', '$window', '$location', function($rootScope, $window, $location) {

        $rootScope.$on('$routeChangeStart', function(evt, nextRoute, prevRoute) {

            if(!prevRoute)
                return;

            var forceReload = !nextRoute; // Reload when no target route

            if(!forceReload && nextRoute) {

                var nextPath = _.trimRight(nextRoute.$$route.originalPath, '/');
                var prevPath = _.trimRight(prevRoute.$$route.originalPath, '/');

                forceReload = nextPath != prevPath; // Always force reload for BCH
            }

            if(forceReload) {
                $window.location = $location.url();
                evt.preventDefault();
            }
        });
    }]);
});
