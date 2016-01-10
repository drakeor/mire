/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = Character;

    // Constructor
    function Character(serverRef) {
        this.server = serverRef;
		this.socketMgr = this.server.socketMgr;
        this.db = this.server.dbManager.db.characters;
		this.user_db = this.server.dbManager.db.users;
        this.data = {};
		this.data.owner = "";
		this.data.name = "";
		this.data.realm = 0;
		
        console.log("Character was initialized!");
    };
	
	Character.prototype.newCharacter = function(realm, owner, name) {
		
		var async = require('async');
		this.data.owner = owner;
		this.data.name = name;
		this.data.realm = realm;
		this.data.room = "room_starting_area";
				
		 async.waterfall([
		 
            // Insert the new character in the database
            (function(callback) {
				this.db.insert(this.data, (function(err, newField) {
					this.data._id = newField._id;
					callback(null, newField._id);
				}).bind(this));
            }).bind(this),
			
			// Update the user database with the new character
			(function(characterID, callback) {
                this.user_db.update({ username: this.data.owner }, 
					{ $addToSet: { characters: characterID } },
					{},
					(function (err, numReplaced) {
						console.log("Replaced " + numReplaced + " records! Error: " + err);
						callback(null, characterID);
					}).bind(this)
				);
            }).bind(this),
			
			// Set the active character
			(function(characterID, callback) {
                this.user_db.update({ username: this.data.owner }, 
					{ $set: { activeCharacter: characterID } },
					{},
					(function (err, numReplaced) {
						console.log("Setting active character... Replaced " + numReplaced + " records!");
						callback(null, characterID);
						
					}).bind(this)
				);
            }).bind(this),
			
			// Inform the user about their character being in the new realm in the starting area.
			(function(characterID, callback) {
                this.socketMgr.sendAll('msg', {
                    user: "",
                    msg: "You have joined the spawn room with your character: " + characterID
                });
            }).bind(this)
			
		], function(err, result) {
            throw new Error(err);
        });
	}
    // Test function
    Character.prototype.testFunction = function() {
        console.log("Allo there!");
    };

});