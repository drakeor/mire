/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports.Config = require('./lib/config.js');
    exports.Realm = require('./lib/realm.js');
    exports.User = require('./lib/user.js');

});