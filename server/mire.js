/* jshint node: true */
"use strict";

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {

  var http = require('http'),
      Socket = require('socket.io');

  /**
   * Expose Mire
   */
  exports = module.exports = Mire;

  exports.Config = require('./mire/config.js');
  exports.Events = require('../shared/events.js');

  function Mire (options) {
    options = options || { };
    this.options = options;
    this.message = "Inside Node!";
    this.events = new exports.Events.Emitter();
    this.config = new exports.Config (this.options, this.events);
    this.server = {};
    this.connectedSockets = {};
    this.clients = {};
    this.io = {};
  }

  Mire.prototype.getMOTD = function () {
    return this.message;
  };

  Mire.prototype.startServer = function () {
    // Setup the callback for the server listen.
    this.events.addEventListener('config_read', this.listen, this);

    // Setup the http server.
    var resHandler = (function (req, res) {
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end('<h1>Hello!</h1><p>' + this.getMOTD() + '</p>');
    }).bind(this);
    this.server = http.createServer(resHandler);

    // Setup Sockets.IO
    this.io = Socket(this.server);
    this.setupSocket();

    // Read the config file.
    this.config.readConfigFile(this.config.readConfigCallback);
  };

  Mire.prototype.listen = function(args) {
    this.server.listen(this.config.getPort(), this.config.getHost());
    console.log('Mire Server listening on http://' + this.config.getHost() + ':' + this.config.getPort().toString() + '/');
  };

  Mire.prototype.setupSocket = function () {
    this.io.on('connection', (function (socket) {
      this.connectedSockets[socket.id] = socket;
      this.clients[socket.id] = {"username": "", loggedIn: false};
      console.log("User Connected.");

      socket.on('disconnect', (function (data) {
        console.log("User Disconnected.");
        for (var sockID in this.connectedSockets) {
          if (this.connectedSockets[sockID] === undefined) {
            continue;
          }

          if (this.clients[sockID].loggedIn) {
            this.connectedSockets[sockID].emit('logged-out', {user: this.clients[socket.id].username});
          }
        }


        this.clients[socket.id] = undefined;
        this.connectedSockets[socket.id] = undefined;
      }).bind(this));

      socket.on('login', (function (data) {
        console.log("User [" + data.user + "] Logged In.");

        this.clients[socket.id].username = data.user;
        this.clients[socket.id].loggedIn = true;
        for (var sockID in this.connectedSockets) {
          if (this.connectedSockets[sockID] === undefined) {
            continue;
          }

          if (this.clients[sockID].loggedIn) {
            this.connectedSockets[sockID].emit('logged-in', {user: this.clients[socket.id].username});
          }
        }
      }).bind(this));

      socket.on('msg', (function (data) {
        console.log("[" + data.user + "]: " + data.msg);

        for (var sockID in this.connectedSockets) {
          if (this.connectedSockets[sockID] === undefined) {
            continue;
          }

          if (this.clients[sockID].loggedIn) {
            this.connectedSockets[sockID].emit('msg', {user: this.clients[socket.id].username, msg: data.msg});
          }
        }
      }).bind(this));

    }).bind(this));
  };

});
