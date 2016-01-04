/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Add Polyfills
    require('es6-promise').polyfill();
    require('../shared/polyfills.js').polyfill();

    // Require all of our libraries
    var http = require('http'),
        Socket = require('socket.io'),
        DBManager = require('./mire/managers/dbmanager.js'),
        Whirlpool = require('../shared/whirlpool.js'),
        RealmManager = require('./mire/managers/realmmanager.js'),
        ConfigManager = require('./mire/managers/configmanager.js'),
        User = require('./mire/players/user.js');

    //
    // Expose Mire
    //
    exports = module.exports = Mire;

    //
    // Constructor
    //
    function Mire(options) {
        options = options || {};
        this.options = options;

        // Server
        this.server = {};
        this.connectedSockets = {};
        this.clients = {};
        this.io = {};

        // Managers
        this.dbManager = new DBManager(this);
        this.realmManager = new RealmManager(this);
        this.config = new ConfigManager(this);
    }

    //
    // Gets the message of the day
    //
    Mire.prototype.getMOTD = function() {
        return this.config.getMOTD();
    };

    //
    // This is called when the server first starts up
    //
    Mire.prototype.startServer = function() {

        // Setup the http server.
        var resHandler = (function(req, res) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end('<h1>Hello!</h1><p>' + this.getMOTD() + '</p>');
        }).bind(this);
        this.server = http.createServer(resHandler);

        // Setup Sockets.IO
        this.io = Socket(this.server);
        this.setupSocket();

        // Load the realms
        this.realmManager.loadRealms();

        // Start listening
        this.listen();
    };

    //
    // Listen function
    //
    Mire.prototype.listen = function(args) {
        this.server.listen(this.config.getPort(), this.config.getHost());
        console.log('Mire Server listening on http://' + this.config.getHost() + ':' + this.config.getPort().toString() + '/');
    };

    //
    // Sets up the socket along with it's associated events
    //
    Mire.prototype.setupSocket = function() {
        this.io.on('connection', (function(socket) {

            // Setup a few variables
            this.connectedSockets[socket.id] = socket;
            this.clients[socket.id] = undefined;

            // Keep track of the number of connections
            this.config.incNumConnections();

            //
            // Disconnect Event
            //
            socket.on('disconnect', (function(data) {
                console.log("User Disconnected.");

                // Send the logout event
                for (var sockID in this.connectedSockets) {
                    if (this.connectedSockets[sockID] === undefined) {
                        continue;
                    }
                    if (this.clients[sockID] !== undefined) {
                        if (this.clients[socket.id] !== undefined) {
                            this.connectedSockets[sockID].emit('logged-out', {
                                user: this.clients[socket.id].getUsername()
                            });
                        } else {
                            console.log("ERROR: Socket is already deleted. Can't send actual username.");
                            debugger;
                        }
                    }
                }

                // Set the clients to undefined
                this.clients[socket.id] = undefined;
                this.connectedSockets[socket.id] = undefined;
            }).bind(this));

            //
            // Login Event
            //
            socket.on('login', (function(data) {
                console.log("User [" + data.user + "] Logged In.");

                // TODO: User needs a logged-in field
                this.clients[socket.id] = new User(this);

                // This is a login query promise.
                this.clients[socket.id].loginUser(data.user, data.pass)
                    .then((function(loginGood) {
                        if (loginGood) {
                            socket.emit('login-good');

                            // Tell the clients of the logged in
                            for (var sockID in this.connectedSockets) {
                                if (this.connectedSockets[sockID] === undefined) {
                                    continue;
                                }

                                if (this.clients[sockID] !== undefined) {
                                    this.connectedSockets[sockID].emit('logged-in', {
                                        user: this.clients[socket.id].getUsername()
                                    });
                                }
                            }

                        } else {
                            // The login failed.
                            //socket.emit('login-bad');
                            this.clients[socket.id].newUser(data.user, data.pass)
                                .then(function(registered) {
                                    if (registered) {
                                        console.log("New user created: [User: " + data.user + ", Pass: " + data.pass + "]");
                                    }
                                });
                        }
                    }).bind(this));
            }).bind(this));


            //
            // Recieve the message
            //
            socket.on('msg', (function(data) {

                // Check for commands!
                var commandThing = data.msg.charAt(0);
                if (commandThing == '/') {
                    var pieces = data.msg.split(" ");
                    var command = pieces[0];

                    // The fabled me command!
                    if (command == "/me") {
                        var tMessage = data.user + " " + data.msg.substring(4);
                        console.log(tMessage);
                        for (var sockID in this.connectedSockets) {
                            if (this.connectedSockets[sockID] === undefined) {
                                continue;
                            }

                            if (this.clients[sockID] !== undefined) {
                                this.connectedSockets[sockID].emit('msg', {
                                    user: "",
                                    msg: tMessage
                                });
                            }
                        }
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
                        for (var sockID in this.connectedSockets) {
                            if (this.connectedSockets[sockID] === undefined) {
                                continue;
                            }

                            if (this.clients[sockID] !== undefined) {
                                rawr = rawr + this.clients[sockID].getUsername() + ", ";
                            }
                        }
                        // Broadcast
                        socket.emit('msg', {
                            user: "Server",
                            msg: rawr
                        });
                    }

                    // Otherwise treat it like a chat message
                } else {
                    console.log("[" + data.user + "]: " + data.msg);

                    // Let everyone know about our message
                    for (var sockID in this.connectedSockets) {
                        if (this.connectedSockets[sockID] === undefined) {
                            continue;
                        }

                        if (this.clients[sockID] !== undefined) {
                            this.connectedSockets[sockID].emit('msg', {
                                user: this.clients[socket.id].getUsername(),
                                msg: data.msg
                            });
                        }
                    }
                }

            }).bind(this));

        }).bind(this));
    };

});
