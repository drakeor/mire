/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = ListVerb;

    var Verb = require('../../server/mire/lib/verb.js');

    // Constructor
    function ListVerb(serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbName = "list";
    }

    ListVerb.prototype = Object.create(Verb.prototype);
    ListVerb.prototype.constructor = ListVerb;

    // Parse Verb
    ListVerb.prototype.parseVerb = function(user, verb, args) {
        Verb.prototype.parseVerb.call(this, user, verb, args);

        // List users
        if (args.msg[0] == 'users' || args.msg[0] == 'user') {
            var rawr = "Users online include ";
            // Gather
            for (var sockID in this.socketMgr.connectedSockets) {
                if (this.socketMgr.connectedSockets[sockID] === undefined) {
                    continue;
                }

                if (this.userMgr.users[sockID] !== undefined) {
                    rawr = rawr + this.userMgr.users[sockID].getUsername() + ", ";
                }
            }

            if (rawr.length > 0)
                rawr = rawr.substr(0, rawr.length - 2);

            // Broadcast
            args.args.socket.emit('msg', {
                user: '',
                msg: rawr
            });
        } else {
            // Broadcast
            args.args.socket.emit('msg', {
                user: '',
                msg: 'I am unsure what you want to list.'
            });
        }
    };

});