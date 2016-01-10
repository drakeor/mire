/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = LexerManager;

    var DBO = require('../dbo.js'),
        fs = require('fs');

    function LexerManager(serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbs = {};

        // Setup Event callbacks
        this.socketMgr.events.addEventListener('socket-msg-pkt', this.handleMessagePacket, this);

        // Load the World and Alias directories
        // First the world.
        this.loadCoreVerbs();

        // Now override them with the alias verbs.
        this.loadAliasVerbs();
    }

    LexerManager.prototype.loadCoreVerbs = function() {
        fs.readdir('./world_core/verbs', (function(err, list) {
            if (!err) {
                list.forEach((function(file) {
                    var verb = new(require('../../../world_core/verbs/' + file))(this.server);
                    this.verbs[verb.getVerbName()] = verb;
                }).bind(this));
            }
        }).bind(this));
    };

    LexerManager.prototype.loadAliasVerbs = function() {
        fs.readdir('./world_alias/verbs', (function(err, list) {
            if (!err) {
                list.forEach((function(file) {
                    var verb = new(require('../../../world_alias/verbs/' + file))(this.server);
                    this.verbs[verb.getVerbName()] = verb;
                }).bind(this));
            }
        }).bind(this));
    };

    LexerManager.prototype.handleMessagePacket = function(args) {
        var socket = args.socket;
        var data = args.data;
        var currentUser = this.userMgr.users[socket.id];

        if (data.msg.length == 0) return;

        var messageSet = data.msg.split(" ");
        var verbString = messageSet[0];
        var verb = {};

        // Find a verb
        if (!this.verbs[verbString]) {
            verb = this.verbs["?"]; // If their verb isn't found, we'll just output a help.
        } else {
            verb = this.verbs[verbString];
        }

        // Parse the verb.
        verb.parseVerb(currentUser, verbString, {
            msg: messageSet.slice(1),
            args: args
        });
    };

});