/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = User;

    // Constructor
    function User(serverRef) {
        this.server = serverRef;
        this.db = this.server.dbService.db.users;
        this.data = {};
        this.data.username = "null";
        this.data.password = "null";
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
    // Returns a promise
    User.prototype.newUser = function(username, passwd) {
        return new Promise(
            (function(resolve, reject) {
                this.db.findOne({
                    username: username
                }, (function(err, data) {
                    if (Object.size(data) == 0) {
                        // This user does not exist, so we create one.
                        this.data.username = username;
                        this.data.password = passwd;

                        // Registers the user in the database
                        this.db.insert(this.data);
                        resolve(true); // we have created a new user
                    } else {
                        resolve(false); // User existed.
                    }
                }).bind(this));
            }).bind(this)
        );
    }

    // Returns a promise.
    User.prototype.loginUser = function(username, passwd) {
        return new Promise(
            (function(resolve, reject) {
                this.db.findOne({
                    username: username,
                    password: passwd
                }, (function(err, data) {
                    if (Object.size(data) == 0) {
                        // This user does not exist.
                        resolve(false);
                    } else {
                        this.data = data;
                        console.log("Loaded player " + username);
                        resolve(true);
                    }
                }).bind(this));
            }).bind(this)
        );
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