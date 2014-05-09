'use strict';

define(['app', 'extended-route-provider'], function(app) {

	app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$routeProvider.
			when('/database/lmo/decisions.shtml',     { templateUrl: '/app/views/lmos/decisions-lmo-id.html', resolveController: true, resolveUser: false }).
			when('/database/lmo/new-decisions.shtml', { templateUrl: '/app/views/lmos/decisions-lmo-id.html', resolveController: true, resolveUser: false });
	}]);
});