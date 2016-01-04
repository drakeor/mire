/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = Polyfill;

    function Polyfill() {}

    Polyfill.polyfill = function() {
        // Let's setup some polyfills
        Object.size = function(obj) {
            var size = 0,
                key;
            for (key in obj) {
                if (obj.hasOwnProperty(key)) size++;
            }
            return size;
        };
    };

});