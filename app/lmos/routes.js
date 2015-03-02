define(['app', 'jquery', 'providers/extended-route'], function(app, $) { 'use strict';

	// relative to: <head><base href="/admin/test_pages/"></head>

	app.config(['extendedRouteProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$routeProvider.
			when('/decisions.shtml', { templateUrl: '/app/lmos/views/lmos/decisions-lmo-id.html', resolveController: true, resolveUser: false });

	}]);
});
