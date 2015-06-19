define(['app'], function (app) { 'use strict';

	app.factory('authentication', ['$http', '$browser', function($http, $browser) {

		var currentUser = null;

		//============================================================
	    //
	    //
	    //============================================================
		function getUser () {

			if(currentUser) return currentUser;

			var headers = { Authorization: 'Ticket ' + $browser.cookies().authenticationToken };

			currentUser = $http.get('/api/v2013/authentication/user', { headers: headers}).then(function onsuccess (response) {
				return response.data;
			}, function onerror () {
				return { userID: 1, name: 'anonymous', email: 'anonymous@domain', government: null, userGroups: null, isAuthenticated: false, isOffline: true, roles: [] };
			});

			return currentUser;
		}

		//============================================================
	    //
	    //
	    //============================================================
		function signOut () {

			document.cookie = 'authenticationToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
			reset();
		}

		//============================================================
	    //
	    //
	    //============================================================
		function reset () {

			currentUser = undefined;
		}

		return { getUser: getUser, signOut: signOut, reset: reset };

	}]);
});
