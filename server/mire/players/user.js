/* jshint node: true */
"use strict";

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {

  // Variables
  exports = module.exports = User;
  
  // Constructor
  function User(serverRef) {
		this.serverRef = serverRef;
		this.data = {};
		this.data.username = "null";
		this.data.email = "null@null.com";
		this.data.characters = {};
		this.data.numConnections = 0;
		
		console.log("User was initialized!");
  }

  // Test function
  User.prototype.testFunction = function() {
	  console.log("Allo there!");
  };
  
  // Registration function
  // Returns true if succeeded
  // Returns false if failed
  User.prototype.newUser = function(username, passwd, email) {
	  this.data.username = username;
	  //this.data.passwd = passwd;
	  this.data.email = email;
	  // Registers the user in the database
	  return true;
  }
  
  // Returns false if the player load failed.
  // Returns true if login succeeded
  User.prototype.loginUser = function(username, passwd) {
		// Attempt login
		
		// Login succeeded!
		this.data.username = username;
		console.log("Loaded player " + username);
		return true;
  }
  
  // Get username
  User.prototype.getUsername = function() {
	  return this.data.username;
  }
  
  // Get email
  User.prototype.getEmail = function() {
	  return this.data.email;
  }
});