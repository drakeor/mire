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
		
		// Server and database references
        this.server = serverRef;
        this.db = this.server.dbManager.db.realms;
		
		// Data reflects what's in the
        this.data = {};
		
		// Realm data reflects what's in the database
        this.realms = {};
        
    }

    // Test function
    RealmManager.prototype.loadRealms = function() {
		console.log("RealmManager was initialized!");
		var async = require('async');
		
		async.waterfall([
			// Check if Realm1 exists
			(function(callback) {
				this.db.findOne({
                    _id : "realm1"
                }, (function(err, data) {
					callback(null, Object.size(data));
                }).bind(this));
			}).bind(this),
			// Recreate Realm1 if it does not exist
			(function(objSize, callback) {
				console.log(callback);
				if(objSize == 0) {
					console.log("realm1 does not exist! Recreating...");
					var realmTemplate = {
						_id: "realm1",
						numConnections: 0,
						owner: "SERVER",
						official: 1
					};
					this.db.insert(realmTemplate, (function(err, newDoc){
						console.log("Realm1 created.");
						callback(null);
					}).bind(this));
				} else {
					callback(null);
				}
			}).bind(this),
			// Load the realms
			(function(callback) {
				this.db.find({}, (function (err, data) {
					this.realms = data;
					for(var i=0; i < data.length; i++) {
						console.log("Realm " + this.realms[i]._id + " has been loaded!");
						this.data[i] = {};
					}
					console.log(data.length + " realms have been loaded!");
					return data;
				}).bind(this));
			}).bind(this)
		], function (err, result) {
			throw new Error(err);
		});
    };
});
