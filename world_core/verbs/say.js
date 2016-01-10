/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = SayVerb;

    var Verb = require('../../server/mire/lib/verb.js');

    // Constructor
    function SayVerb (serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbName = "say";
    }

    SayVerb.prototype = Object.create(Verb.prototype);
    SayVerb.prototype.constructor = SayVerb;

    // Parse Verb
    SayVerb.prototype.parseVerb = function(user, verb, args) {
        Verb.prototype.parseVerb.call(this, user, verb, args);

        var message = args.msg.join(" ");

        // Send out a message
        this.socketMgr.sendAll('msg', {
            user: user.getUsername(),
            msg: args.msg.join(" ")
        });
    };

});
