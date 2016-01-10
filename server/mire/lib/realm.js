/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = Realm;
	var Room = require('../lib/room.js');
	var fs = require("fs");
	
    // Constructor
    function Realm(serverRef, data) {
        this.server = serverRef;
        // This holds the database data
        this.data = data;
		this.rooms = {};
    }

	// Load rooms
	Realm.prototype.loadRooms = function() {
		// Read the directory
		  var dir = "./world_core/rooms";
		  fs.readdir(dir, (function (err, list) {
			if (err) {
			  throw ("NO ROOMS CAN BE LOADED: " + err);
			}
			// For every file in the list
			list.forEach((function (file) {
				var path = dir + "/" + file;
				//console.log("ROOM FOUND: " + path);
				var loadedRoomClass = require("../../../" + path);
				var loadedRoom = new loadedRoomClass(new Room());
				var finalRoom = loadedRoom.SetupRoom(loadedRoom);
				console.log("LOADING ROOM: " + finalRoom.getId());
				this.rooms[finalRoom.getId()] = finalRoom;
				// TODO: If exists in custom, load that over core.
			}).bind(this));
		}).bind(this));
		
		// TODO, load custom rooms
	};
	
    // Test function
    Realm.prototype.getId = function() {
        return this.data._id;
    };

});