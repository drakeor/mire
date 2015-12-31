/* jshint node: true */
"use strict";

var requirejs = require('requirejs');

requirejs.config({
    baseUrl: __dirname,
    nodeRequire: require
});

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    var Mire = require('./server/mire.js');

    var options = {
        basePath: __dirname
    }

    var mire = new Mire(options);

    mire.startServer();

});