/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = HelpVerb;

    var Verb = require('../../server/mire/lib/verb.js');

    // Constructor
    function HelpVerb (serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbName = "?";
    }

    HelpVerb.prototype = Object.create(Verb.prototype);
    HelpVerb.prototype.constructor = HelpVerb;

    // Parse Verb
    HelpVerb.prototype.parseVerb = function(user, verb, args) {
        Verb.prototype.parseVerb.call(this, user, verb, args);

        args.args.socket.emit('msg', {
            user: "",
            msg: "Mire uses a set of verbs to control and describe the environment around you."
        });

        args.args.socket.emit('msg', {
            user: "",
            msg: "The verbs are listed below."
        });

        args.args.socket.emit('msg', {
            user: "",
            msg: "me MSG - Will emit an emote."
        });

        args.args.socket.emit('msg', {
            user: "",
            msg: "say MSG - Will allow you to chat globally."
        });

        args.args.socket.emit('msg', {
            user: "",
            msg: "list users - Will list all online users"
        });

        args.args.socket.emit('msg', {
            user: "",
            msg: "? - Will print this help message."
        });

        args.args.socket.emit('msg', {
            user: "",
            msg: "test newcharacter NAME - Will create a new character and set its name."
        });
    };

});
