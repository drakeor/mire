/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = Config;

    function Config(serverRef, variable, defaultValue) {
        // Default to using strings
        defaultValue = typeof defaultValue !== 'undefined' ? defaultValue : "";

        this.variable = variable;
        this.value = defaultValue;

        this.server = serverRef;
        this.db = this.server.dbManager.db.config;

        this.db.findOne({
            variable: this.variable
        }, (function(err, data) {
            if (Object.size(data) == 0) {
                // We should initialize this value.
                this.db.insert({
                    variable: this.variable,
                    value: this.value
                });
            } else {
                this.value = data.value;
            }
        }).bind(this));
    }

    Config.prototype.set = function(value) {
        this.value = value;
        this.db.update({
            variable: this.variable
        }, {
            $set: {
                value: this.value
            }
        }, {});
    };

    Config.prototype.get = function() {
        return this.value;
    };

});
