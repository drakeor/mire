/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = LexerManager;

    var DBO = require('../dbo.js');

    function LexerManager(serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        // Setup Event callbacks
        this.socketMgr.events.addEventListener('socket-msg-pkt', this.handleMessagePacket, this);
    }

    LexerManager.prototype.handleMessagePacket = function(args) {
        var socket = args.socket;
        var data = args.data;

        // Check for commands!
        var commandThing = data.msg.charAt(0);
        if (commandThing == '/') {
            var pieces = data.msg.split(" ");
            var command = pieces[0];

            // The fabled me command!
            if (command == "/me") {
                var tMessage = data.user + " " + data.msg.substring(4);
                console.log(tMessage);

                this.socketMgr.sendAll('msg', {
                    user: "",
                    msg: tMessage
                });
            }

			if (command == "/newcharacter") {
					var tCharacter = new DBO.Character(this.server);
					tCharacter.newCharacter(1, this.userMgr.users[socket.id].getUsername(), data.msg.substring(14));
					this.userMgr.users[socket.id].currentCharacter = tCharacter;
			}
			
            // For the sorry sad SOBs that need "help"
            if (command == "/help") {
                socket.emit('msg', {
                    user: "SERVER",
                    msg: "Get lost. Commands are /me and /listusers"
                });
            }

            // Lists all of the player
            if (command == "/listusers") {
                var rawr = "";
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
                socket.emit('msg', {
                    user: "Server",
                    msg: rawr
                });
            }

            // Otherwise treat it like a chat message
        } else {
            console.log("[" + data.user + "]: " + data.msg);

            this.socketMgr.sendAll('msg', {
                user: this.userMgr.users[socket.id].getUsername(),
                msg: data.msg
            });
        }

    };

});