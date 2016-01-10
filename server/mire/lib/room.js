/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

// This is a base room class
define(function(require, exports, module) {

    // Variables
    exports = module.exports = Room;

    // Constructor
    function Room(serverRef, data) {
        this.server = serverRef;
        // This holds the database data
		this.config = {};
        this.data = data;
    }

    // Test function
    Room.prototype.getId = function() {
        return this.data._id;
    };

});