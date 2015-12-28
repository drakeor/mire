/* jshint node: true */
"use strict";

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {

  var fs = require('fs'),
      path = require('path');

  /**
   * Expose `Config`.
   */
  module.exports = Config;

  function Config (options, events) {
    options = options || { };
    this.options = options;
    this.hostname = "0.0.0.0";
    this.port = 5345;
    this.events = events;
  }

  Config.prototype.getHost = function () {
    return this.hostname;
  };

  Config.prototype.getPort = function () {
    return this.port;
  };

  Config.prototype.readConfigFile = function (callback) {
    var callbackToCall = callback.bind(this);
    fs.readFile(
      path.join(this.options.basePath, 'config.js'), function (err, data) {
        callbackToCall(data);
      });
  };

  Config.prototype.readConfigCallback = function (data) {
    var dataJSON = JSON.parse(data);
    this.hostname = dataJSON.host;
    this.port = dataJSON.port;

    this.events.emit('config_read', {});
    this.events = null; // Null out the circular reference.
  };

});
