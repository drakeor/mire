/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = RealmManager;

    // Constructor
    function RealmManager(serverRef) {
        this.server = serverRef;
        this.db = this.server.dbManager.db.realms;
        this.data = {};
        this.realms = {};
        console.log("RealmManager was initialized!");
    }

    // Test function
    RealmManager.prototype.loadRealms = function() {
		
		// Load our realms from the database. REALM1 should ALWAYS exist!
		db.find({}, function (err, data) {
		  // docs is an array containing documents Mars, Earth, Jupiter
		  // If no document is found, docs is equal to []
		});

		
    };
});
