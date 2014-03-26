'use strict';

define(['app'], function(app) {
	
	app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {

		$locationProvider.html5Mode(true);
		$locationProvider.hashPrefix('!');

		$routeProvider.
			when('/database/lmo/decisions.shtml', { templateUrl: '/app/views/lmos/decisions-lmo-id.html', resolve: { dependencies: resolveDependencies() } });
	}]);

	//==================================================
	//
	//
	//==================================================
	function resolveDependencies() {

		return ['$q', '$route', function($q, $route) {

			var deferred = $q.defer();

			require([$route.current.$$route.templateUrl + ".js"], function() {
				deferred.resolve();
			});

			return deferred.promise;
		}];
	}	
});
