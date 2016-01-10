/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = MeVerb;

    var Verb = require('../../server/mire/lib/verb.js');

    // Constructor
    function MeVerb (serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbName = "me";
    }

    MeVerb.prototype = Object.create(Verb.prototype);
    MeVerb.prototype.constructor = MeVerb;

    // Parse Verb
    MeVerb.prototype.parseVerb = function(user, verb, args) {
        Verb.prototype.parseVerb.call(this, user, verb, args);

        var message = args.msg.join(" ");

        // Send out an emote.
        this.socketMgr.sendAll('msg', {
            user: "",
            msg: user.getUsername() + ' ' + message
        });
    };

});
