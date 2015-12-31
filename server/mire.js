/* jshint node: true */
"use strict";

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {

  // Add ES6-Promise
  require('es6-promise').polyfill();

  var http = require('http'),
      Socket = require('socket.io'),
      DBService = require('./mire/services/dbservice.js'),
      DBO = require('./mire/dbo.js'),
      Whirlpool = require('../shared/whirlpool.js'),
	  User = require('./mire/players/user.js');

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
    this.dbService = new DBService(this);
    this.config_db = {};
  }

  Mire.prototype.getMOTD = function () {
    return this.config_db.motd.get();
  };

  Mire.prototype.startServer = function () {
    // Let's setup some polyfills
    Object.size = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };


    console.log(Whirlpool.init().add("asdf").finalize());

    // Setup the callback for the server listen.
    this.events.addEventListener('config_read', this.listen, this);

    // Let's initialize the DB Service.
    this.dbService.initService();

    // Let's create a config dbo
    this.config_db.numConnections = new DBO.Config(this, "numConnections", 0);
    this.config_db.motd = new DBO.Config(this, "motd", "Inside NODE!");

    this.config_db.motd.set("We have now served: " + this.config_db.numConnections.get() + " people!");

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
      // this.clients[socket.id] = {username: "", loggedIn: false};
	  this.clients[socket.id] = undefined;

      this.config_db.numConnections.set(this.config_db.numConnections.get() + 1);
      this.config_db.motd.set("We have now served: " + this.config_db.numConnections.get() + " people!");

      console.log("User Connected. [Connection #" + this.config_db.numConnections.get() + "]");

      socket.on('disconnect', (function (data) {
        console.log("User Disconnected.");
        for (var sockID in this.connectedSockets) {
          if (this.connectedSockets[sockID] === undefined) {
            continue;
          }

          if (this.clients[sockID] !== undefined) {
			if (this.clients[socket.id] !== undefined) {
				this.connectedSockets[sockID].emit('logged-out', {user: this.clients[socket.id].getUsername()});
			} else {
				console.log("ERROR: Socket is already deleted. Can't send actual username.");
				debugger;
			}
          }
        }


        this.clients[socket.id] = undefined;
        this.connectedSockets[socket.id] = undefined;
      }).bind(this));

      socket.on('login', (function (data) {
        console.log("User [" + data.user + "] Logged In.");

        //this.clients[socket.id].username = data.user;
        //this.clients[socket.id].loggedIn = true;

		// TODO: ADD LOGIN CODE HERE BEFORE DOING THIS
		this.clients[socket.id] = new User(this);

    // This is a login query promise.
		this.clients[socket.id].loginUser(data.user, data.pass)
      .then( (function (loginGood) {
        if (loginGood) {
          socket.emit('login-good');
          for (var sockID in this.connectedSockets) {
            if (this.connectedSockets[sockID] === undefined) {
              continue;
            }

            if (this.clients[sockID] !== undefined) {
              this.connectedSockets[sockID].emit('logged-in', {user: this.clients[socket.id].getUsername()});
            }
          }
        } else {
          // The login failed.
          //socket.emit('login-bad');
          this.clients[socket.id].newUser(data.user, data.pass)
            .then(function (registered) {
              if (registered) {
                console.log("New user created: [User: " + data.user + ", Pass: " + data.pass + "]");
              }
            });
        }
      }).bind(this));
    }).bind(this));

      socket.on('msg', (function (data) {

		// Check for commands!
		var commandThing = data.msg.charAt(0);
		if(commandThing == '/') {
			var pieces = data.msg.split(" ");
			var command = pieces[0];

			// The fabled me command!
			if(command == "/me") {
				var tMessage = data.user + " " + data.msg.substring(4);
				console.log(tMessage);
				for (var sockID in this.connectedSockets) {
				  if (this.connectedSockets[sockID] === undefined) {
					continue;
				  }

				  if (this.clients[sockID] !== undefined) {
					this.connectedSockets[sockID].emit('msg', {user: "", msg: tMessage});
				  }
				}
			}

			// For the sorry sad SOBs that need "help"
			if(command == "/help") {
				socket.emit('msg', {user: "SERVER", msg: "Get lost. Commands are /me and /listusers"});
			}

			// Lists all of the player
			if(command == "/listusers") {
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
				socket.emit('msg', {user: "Server", msg: rawr});
			}

		// Otherwise treat it like a chat message
		} else {
        console.log("[" + data.user + "]: " + data.msg);

			for (var sockID in this.connectedSockets) {
			  if (this.connectedSockets[sockID] === undefined) {
				continue;
			  }

			  if (this.clients[sockID] !== undefined) {
				this.connectedSockets[sockID].emit('msg', {user: this.clients[socket.id].getUsername(), msg: data.msg});
			  }
			}
		}

      }).bind(this));

    }).bind(this));
  };

});
