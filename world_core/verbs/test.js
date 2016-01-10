/* jshint node: true */
"use strict";

if (typeof define !== 'function') {
    var define = require('amdefine')(module)
}

define(function(require, exports, module) {

    // Variables
    exports = module.exports = TestVerb;

    var Verb = require('../../server/mire/lib/verb.js'),
        DBO = require('../../server/mire/dbo.js');

    // Constructor
    function TestVerb(serverRef) {
        this.server = serverRef;
        this.socketMgr = this.server.socketMgr;
        this.userMgr = this.server.userMgr;

        this.verbName = "test";
    }

    TestVerb.prototype = Object.create(Verb.prototype);
    TestVerb.prototype.constructor = TestVerb;

    // Parse Verb
    TestVerb.prototype.parseVerb = function(user, verb, args) {
        Verb.prototype.parseVerb.call(this, user, verb, args);

        if (args.msg[0] == 'newcharacter') {
            var tCharacter = new DBO.Character(this.server);
            tCharacter.newCharacter(1, user.getUsername(), args.msg.slice(1).join(" "));
            user.currentCharacter = tCharacter;
        } else {

            args.args.socket.emit('msg', {
                user: '',
                msg: 'I am unsure what you want to test.'
            });
        }
    };

});