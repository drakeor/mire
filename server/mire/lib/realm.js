/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = Realm;
	var Room = require('../lib/room.js');
	
    // Constructor
    function Realm(serverRef, data) {
        this.server = serverRef;
        // This holds the database data
        this.data = data;
    }

	// Load rooms
	Realm.prototype.loadRooms = function() {
		
	}
	
    // Test function
    Realm.prototype.getId = function() {
        return this.data._id;
    };

});