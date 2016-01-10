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
        this.verbName = "";
    }

    // Parse Verb
    Verb.prototype.parseVerb = function(user, verb, args) {
        console.log(user.getUsername() + " will " + verb + " " + args.msg.join(" "));
    };

    Verb.prototype.getVerbName = function () {
        return this.verbName;
    };

});
