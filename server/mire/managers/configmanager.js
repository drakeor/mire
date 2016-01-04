/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = ConfigManager;

    var DBO = require('../dbo.js');

    function ConfigManager(serverRef, dbRef) {
        this.server = serverRef;

        this.host = new DBO.Config(this.server, "host", "127.0.0.1", dbRef);
        this.port = new DBO.Config(this.server, "port", 8173, dbRef);
        this.numConnections = new DBO.Config(this.server, "numConnections", 0, dbRef);
        this.motd = new DBO.Config(this.server, "motd", "Inside NODE!", dbRef);
    }

    ConfigManager.prototype.getHost = function () {
      return this.host.get();
    };

    ConfigManager.prototype.setHost = function (host) {
      this.host.set(host);
    };

    ConfigManager.prototype.getPort = function () {
      return this.port.get();
    };

    ConfigManager.prototype.setPort = function (port) {
      this.port.set(port);
    };

    ConfigManager.prototype.getNumConnections = function () {
      return this.numConnections.get();
    };

    ConfigManager.prototype.incNumConnections = function () {
      return this.numConnections.set(this.numConnections.get() + 1);
    };

    ConfigManager.prototype.getMOTD = function () {
      return this.motd.get();
    };

    ConfigManager.prototype.setMOTD = function (motd) {
      this.motd.set(motd);
    };

});
