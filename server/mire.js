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
        SocketManager = require('./mire/managers/socketmanager.js'),
        UserManager = require('./mire/managers/usermanager.js'),
        LexerManager = require('./mire/managers/lexermanager.js'),
        DBO = require('./mire/dbo.js');

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

        // Managers
        this.dbManager = new DBManager(this);
        this.realmManager = new RealmManager(this);
        this.config = new ConfigManager(this);
        this.socketMgr = new SocketManager(this);
        this.userMgr = new UserManager(this);
        this.lexerMgr = new LexerManager(this);

        // Start the server after we are done reading config data.
        this.config.events.addEventListener('config-done', this.startServer, this);
    }

    //
    // Gets the message of the day
    //
    Mire.prototype.getMOTD = function() {
        return this.config.getMOTD();
    };

    //
    // Listen function
    //
    Mire.prototype.startServer = function() {
        this.socketMgr.startServer();

        this.realmManager.loadRealms();

        this.socketMgr.listen();
    };



});