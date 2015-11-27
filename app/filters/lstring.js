define(['app'], function(app) { 'use strict';

    app.filter("lstring", ['locale', function(defaultLocale) {
    	return function(ltext, locale) {

    		if(!ltext)
    			return '';

    		if(typeof(ltext) == 'string')
    			return ltext;

    		var sText;

            locale = locale || defaultLocale;

    		if(!sText && locale)
    			sText = ltext[locale];

    		if(!sText)
    			sText = ltext.en;

    		if(!sText) {
    			for(var key in ltext) {
    				sText = ltext[key];
    				if(sText)
    					break;
    			}
    		}

    		return sText||'';
    	};
    }]);
});
