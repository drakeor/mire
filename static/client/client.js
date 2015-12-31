/// <reference path="./index.js" />
/// <reference path="./client/mire/lib/renderer.js" />
/// <reference path="./client/mire/lib/ui/element.js" />

"use strict";

define(function(require, exports, module) {

  var $ = require('./jquery'),
      io = require('socket.io'),
      StateMachine = require('/shared/machine.js'),
      Whirlpool = require('/shared/whirlpool.js');

  var me = {
    socket: {},
    connected: false,
    loggedIn: false,
    userName: "",
    fsm: new StateMachine(),
    connected: function () {
      this.loggedIn = false;
      this.connected = true;

      this.add_msg("Connected to Server");

    	// Login to the server
    	this.userName = prompt("[TEMPORARY] Please enter your username", "Guest" + Math.floor((Math.random() * 10) + 1));
    	this.socket.emit('login', {user:this.userName, pass:'lol'});
    },
    disconnected: function () {
      this.loggedIn = false;
      this.connected = false;

      this.add_msg("Disconnected from Server");
    },
    login_bad: function () {
      alert("Oops! That didn't work!");

    	// Login to the server
    	this.userName = prompt("[TEMPORARY] Please enter your username", "Guest" + Math.floor((Math.random() * 10) + 1));
    	this.socket.emit('login', {user:this.userName, pass:'lol'});
    },
    login_good: function () {
      console.log("Client Logged In.");
    },
    add_msg: function (msg) {
    	$('#messages').append($('<li>').text(msg));
      $('#wrapper').scrollTop($('#wrapper').prop('scrollHeight'));
    }
  };

  // DOM Not Ready State
  me.fsm.addTransition("DOM Not Ready", "Not Connected", "dom_ready");
  me.fsm.addTransition("DOM Not Ready", "Connected, DOM Not Ready", "connected");

  // Connected, DOM Not Ready State
  me.fsm.addTransition("Connected, DOM Not Ready", "Login", "dom_ready");
  me.fsm.addTransitionCallback("Connected, DOM Not Ready", "dom_ready", me.connected.bind(me));
  me.fsm.addTransition("Connected, DOM Not Ready", "DOM Not Ready", "disconnected");

  // Not Connected State
  me.fsm.addTransition("Not Connected", "Login", "connected");
  me.fsm.addTransitionCallback("Not Connected", "connected", me.connected.bind(me));

  // Login State
  me.fsm.addTransition("Login", "Login", "login_bad");
  me.fsm.addTransitionCallback("Login", "login_bad", me.login_bad.bind(me));
  me.fsm.addTransition("Login", "In World", "login_good");
  me.fsm.addTransitionCallback("Login", "login_good", me.login_good.bind(me));
  me.fsm.addTransition("Login", "Not Connected", "disconnected");
  me.fsm.addTransitionCallback("Login", "disconnected", me.disconnected.bind(me));

  // In World State
  me.fsm.addTransition("In World", "Not Connected", "disconnected");
  me.fsm.addTransitionCallback("In World", "disconnected", me.disconnected.bind(me));

  me.socket = io.connect('http://' + window.location.hostname + ':8173/');
  me.socket.on('connect', function() {
    console.log("SOCKET_EVENT: Connected to server.");
    me.fsm.pushEvent("connected");
  });

  me.socket.on('disconnect', function () {
    console.log("SOCKET_EVENT: Disconnected from server.");
    me.fsm.pushEvent("disconnected");
  });

  me.socket.on('msg', function (data) {
      console.log(data.user + ": " + data.msg);
      me.add_msg(data.user + ": " + data.msg);
  });

  me.socket.on('logged-in', function (data) {
      if (!me.loggedIn && data.user == me.userName)
        me.fsm.pushEvent("login_good");

      console.log(data.user + " has logged in.");
      me.add_msg(data.user + " has logged in.");
  });

  me.socket.on('logged-out', function (data) {
      console.log(data.user + " has logged out.");
      me.add_msg(data.user + " has logged out.");
  });

  $(function() {
    me.fsm.pushEvent("dom_ready");
    $("#m").focus();
    console.log(Whirlpool.init().add("asdf").finalize());

  	// Register a function to handle the chat
  	$('form').submit(function(){
      if ($('#m').val() != '') {
    		me.socket.emit('msg', {user: me.userName, msg: $('#m').val()});
    		$('#m').val('');
      }
  		return false;
	  });

  });

});
