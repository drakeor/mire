/* jshint node: true */
"use strict";

if (typeof define !== 'function') { var define = require('amdefine')(module) }

define(function (require, exports, module) {

  var Datastore = require('nedb');

  exports = module.exports = DBService;

  function DBService (serverRef)
  {
    this.server = serverRef;

    // Declare the Datastores
    this.db = {
      config: {},
      users: {}
    };
  }

  DBService.prototype.initService = function () {
    for (var storeName in this.db)
    {
      if (this.db.hasOwnProperty(storeName)) {
        // Initialize each data store.
        this.db[storeName] = new Datastore({ filename: './db/' + storeName + '.db', autoload: true });
      }
    }
  };

});