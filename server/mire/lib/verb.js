/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = Verb;

    // Constructor
    function Verb () {
    }

    // Parse Verb
    Verb.prototype.parseVerb = function(user, verb, arguments) {
        console.log(user.getUsername() + " will " + verb + arguments.join(" "));
    };

});
