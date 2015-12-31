/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    exports = module.exports = Emitter;

    function Emitter() {
        this.eventList = {};
    };

    Emitter.prototype.addEventListener = function(event, callback, binder, priority) {
        var p = priority || 0;

        // Add the callbacks to the emitter.
        this.eventList[event] = this.eventList[event] || new Array();
        this.eventList[event].push({
            func: callback,
            obj: binder,
            priority: p
        });

        // Sort the event list.
        this.eventList[event].sort(function(a, b) {
            if (a.priority > b.priority) {
                return -1; // Lower index if a is larger than b.
            }
            if (a.priority < b.priority) {
                return 1; // Higher index if a is smaller than b.
            }
            return 0;
        });
    };

    Emitter.prototype.emit = function(event, args) {
        // If the event in question exists...
        if (this.eventList[event] instanceof Array && this.eventList[event].length > 0) {
            // Loop through it and call the callbacks.
            this.eventList[event].forEach(function(element) {
                var call = element.func.bind(element.obj);
                call(args);
            });
        }
    }

});