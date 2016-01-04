/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = Realm;

    // Constructor
    function Realm(serverRef, data) {
        this.server = serverRef;
        // This holds the database data
        this.data = data;
    }

    // Test function
    Realm.prototype.getId = function() {
        return this.data._id;
    };

});