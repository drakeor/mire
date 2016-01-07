/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    var http = require('http'),
        Socket = require('socket.io'),
        Events = require('../../../shared/events.js');

    exports = module.exports = SocketManager;

    function SocketManager(serverRef) {
        this.server = serverRef;

        // Server
        this.httpServer = {};
        this.connectedSockets = {};
        this.io = {};
        this.events = new Events.Emitter();
    }

    SocketManager.prototype.sendAll = function(event, data) {
        for (var sockID in this.connectedSockets) {
            if (this.connectedSockets[sockID] === undefined) {
                continue;
            }
            this.connectedSockets[sockID].emit(event, data);
        }
    };

    //
    // Event Callback for Connect Events
    //
    SocketManager.prototype.onSocketConnect = function(socket) {
        // Setup a few variables
        this.connectedSockets[socket.id] = socket;

        // Keep track of the number of connections
        this.server.config.incNumConnections();

        // Send the Connect Event
        this.events.emit('client-connect', {
            socket: socket
        });
    };

    //
    // Event Callback for Disconnect Events
    //
    SocketManager.prototype.onSocketDisconnect = function(socket, data) {
        // Send the disconnect event
        this.events.emit('socket-disconnect', {
            socket: socket,
            data: data
        });

        // Set the clients to undefined
        this.connectedSockets[socket.id] = undefined;
    };

    //
    // Event Callback for the Login Packet
    //
    SocketManager.prototype.onSocketLoginPacket = function(socket, data) {
        this.events.emit('socket-login-pkt', {
            socket: socket,
            data: data
        });
    }

    //
    // Event Callback for the Message Packet
    //
    SocketManager.prototype.onSocketMessagePacket = function(socket, data) {
        this.events.emit('socket-msg-pkt', {
            socket: socket,
            data: data
        });
    }

    //
    // This is called when the server first starts up
    //
    SocketManager.prototype.startServer = function() {

        // Setup the http server.
        var resHandler = (function(req, res) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            res.end('');
        }).bind(this);
        this.httpServer = http.createServer(resHandler);

        // Setup Sockets.IO
        this.io = Socket(this.httpServer);
        this.setupSocket();
    };

    SocketManager.prototype.listen = function() {
        // Start listening
        this.httpServer.listen(this.server.config.getPort(), this.server.config.getHost());
        console.log('Mire Server listening on http://' + this.server.config.getHost() + ':' + this.server.config.getPort().toString() + '/');
    };

    //
    // Sets up the socket along with it's associated events
    //
    SocketManager.prototype.setupSocket = function() {
        this.io.on('connection', (function(socket) {

            // Handle Socket Connections
            this.onSocketConnect(socket);

            //
            // Disconnect Event
            //
            socket.on('disconnect', (function(data) {
                this.onSocketDisconnect(socket, data);
            }).bind(this));

            //
            // Login Event
            //
            socket.on('login', (function(data) {
                this.onSocketLoginPacket(socket, data);
            }).bind(this));

            //
            // Recieve the message
            //
            socket.on('msg', (function(data) {
                this.onSocketMessagePacket(socket, data);
            }).bind(this));

        }).bind(this));
    };

});