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

        // Room configuration
        this.config = {
            id: "noid",
            name: "untitled",
            description: "no description",
            world_x: 0,
            world_y: 0,
            scale_x: 1,
            scale_y: 1
        };
        this.data = data;
    }

    // Test function
    Room.prototype.getId = function() {
        return this.config.id;
    };

});