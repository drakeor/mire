/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = StatusVerb;

    var Verb = require('../../server/mire/lib/verb.js');

    // Constructor
    function StatusVerb(serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbName = "status";
    }

    StatusVerb.prototype = Object.create(Verb.prototype);
    StatusVerb.prototype.constructor = StatusVerb;

    // Parse Verb
    StatusVerb.prototype.parseVerb = function(user, verb, args) {
        Verb.prototype.parseVerb.call(this, user, verb, args);

        var message = args.msg.join(" ");

        // Send out the player status
		if(user.activeCharacter != null) {
			var message = "You are playing as " + user.characters[user.activeCharacter].data.name 
				+ " in " + user.characters[user.activeCharacter].data.room + " of " + user.characters[user.activeCharacter].data.realm;
		} else {
			var message = "You are not playing any characters.";
		}
        this.socketMgr.sendAll('msg', {
            user: "",
            msg: message
        });
    };

});