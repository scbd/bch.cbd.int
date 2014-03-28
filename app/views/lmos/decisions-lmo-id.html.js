'use strict';

define(['app', 'underscore'], function(app, _) {

	return ['$scope', '$http', '$route', '$cookies', function($scope, $http, $route, $cookies) {

		var documentID = parseInt($route.current.params.documentid || '');
		var countries  = {};

		//============================================================
		//
		//
		//============================================================
		$http.get('https://api.cbd.int/api/v2013/countries').then(function(r) {

			_.each(r.data, function(c) { countries[c.code.toLowerCase()] = c.name.en; });

			countries.eur = countries.eur || countries.eu;

		}).catch(function(error) {
			console.log('ERROR:', error);
		});

		//============================================================
		//
		//
		//============================================================
		$http.get('https://api.cbd.int/api/v2013/lmos/' + bchStorageIdToObjectId(documentID) + '/decisions').then(function(r) {

			$scope.lmo = r.data;

		}).catch(function(error) {
			console.log('ERROR:', error);
		});

		//============================================================
		//
		//
		//============================================================
		$scope.$watch('showDatabase', function(_new){
			$cookies.showDatabase = _new;
		});
		
		$scope.showDatabase = $cookies.showDatabase || "";

		//============================================================
		//
		//
		//============================================================
		$scope.isCountryVisible = function(country) {
			return (country.bch && country.bch.length) ||
			       (country.biotrade && country.biotrade.length && $scope.showBiostradestatus);
		};

		//============================================================
		//
		//
		//============================================================
		$scope.getCountryName = function(o) {
			return countries[o.country] || o.country;
		};

		//============================================================
		//
		//
		//============================================================
		function bchStorageIdToObjectId(d) {
			var hex = Number(d).toString(16);

			return '52000000CBD0900000000000'.substr(0, 24 - hex.length) + hex;
		}
	}];
});