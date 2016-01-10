/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {
    // Class stuff
    exports = module.exports = Room_Starting_Area;

    function Room_Starting_Area(roomClass) {
        this.roomClass = roomClass;
    }

    // This is the important function here
    // We are simply taking it and passing it right back
    Room_Starting_Area.prototype.SetupRoom = function(roomClass) {
        this.roomClass.config.id = "room_starting_area";
        this.roomClass.config.name = "Starting Area";
        this.roomClass.config.description = "The default area the player will start in";
        return this.roomClass;
    }
});