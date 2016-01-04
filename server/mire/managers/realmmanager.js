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
        this.db = this.server.dbManager.db.users;
        this.data = {};
        this.realms = {};
        
    }

    // Test function
    RealmManager.prototype.loadRealms = function() {
		console.log(Object.getOwnPropertyNames(this.server.dbManager.db.users));
		console.log("RealmManager was initialized!");
		// Load our realms from the database. REALM1 should ALWAYS exist!
		/*this.db.find({}, function (err, data) {
			if(data.length == 0) {
				throw new Error('ERROR 0x1: The RealmManager MUST include at least one realm under realms.db to function properly!');
			}
			this.realms = data;
			for(var i=0; i < data.length; i++) {
				console.log("Realm " + this.realms[i]._id + " has been loaded!");
			}
			console.log(data.length + " realms have been loaded!");
		});*/

		
    };
});
