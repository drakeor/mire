/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {
	
	// Variables
    exports = module.exports = Room_Starting_Area;
	
	// Constructor
    function Room_Starting_Area(serverRef, data) {
        this.server = serverRef;
        // This holds the database data
		this.config = {};
        this.data = data;
    }
}