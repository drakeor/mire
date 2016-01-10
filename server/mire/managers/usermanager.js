/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = UserManager;

    var DBO = require('../dbo.js');

    function UserManager(serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;

        this.users = {};

        // Setup Event callbacks
        this.socketMgr.events.addEventListener('socket-disconnect', this.handleDisconnect, this);
        this.socketMgr.events.addEventListener('socket-login-pkt', this.handleLoginPacket, this);
    }

    UserManager.prototype.handleDisconnect = function(args) {
        var socket = args.socket;
        var data = args.data;

        if (this.users[socket.id] !== undefined) {
            this.socketMgr.sendAll('logged-out', {
                user: this.users[socket.id].getUsername()
            });
        }

        this.users[socket.id] = undefined;
    };

    UserManager.prototype.handleLoginPacket = function(args) {
        var socket = args.socket;
        var data = args.data;

        console.log("User [" + data.user + "] Logged In.");

        // TODO: User needs a logged-in field
        this.users[socket.id] = new DBO.User(this.server);

        // This is a login query promise.
        this.users[socket.id].loginUser(data.user, data.pass)
            .then((function(loginGood) {
                if (loginGood) {
                    socket.emit('login-good');

                    this.socketMgr.sendAll('logged-in', {
                        user: this.users[socket.id].getUsername()
                    });

                    // Initial Help Message
                    this.server.lexerMgr.verbs["?"].parseVerb(this.users[socket.id], '?', {msg: [], args: {socket: socket}});

                } else {
                    // The login failed.
                    //socket.emit('login-bad');
                    this.users[socket.id].newUser(data.user, data.pass)
                        .then(function(registered) {
                            if (registered) {
                                console.log("New user created: [User: " + data.user + ", Pass: " + data.pass + "]");
                            }
                        });
                }
            }).bind(this));
    }

});
