/* jshint node: true */
"use strict";

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {

  exports = module.exports = Player;
  
  // Constructor
  function Player(serverRef) {
	  this.serverRef = serverRef;
	  this.player = {};
	  console.log("Player was initialized!");
  }

  function buildInitialStructure() {
		var playerstruct = {};
		playerstruct.username = "null";
		playerstruct.email = "null@null.com";
		playerstruct.characters = {};
		return playerstruct;
  }
  
  Player.prototype.testFunction = function() {
	  console.log("Allo there!");
  };
  
  // Please check the login before calling this.
  // Returns null if the player load failed.
  // Returns the structure if login succeeded
  Player.prototype.loadPlayer = function(username) {
	  this.player[username] = buildInitialStructure();
	  this.player[username].username = username;
	  console.log("Loaded player " + this.player[username]);
	  return this.player[username];
  }
  
});