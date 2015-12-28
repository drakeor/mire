/// <reference path="./index.js" />
/// <reference path="./client/mire/lib/renderer.js" />
/// <reference path="./client/mire/lib/ui/element.js" />

"use strict";

define(function(require, exports, module) {

  var $ = require('./jquery'),
      io = require('socket.io'),
      StateMachine = require('/shared/machine.js');

  var chatPanel = {};

  var socket = io.connect('http://' + window.location.hostname + ':8173/');
  socket.on('connect', function() {
    console.log("SOCKET_EVENT: Connected to server.");
	$('#messages').append($('<li>').text("Connected to the server"));
  });

  socket.on('disconnect', function () {
    console.log("SOCKET_EVENT: Disconnected from server.");
  });

  socket.on('msg', function (data) {
      console.log(data.user + ": " + data.msg);
	  $('#messages').append($('<li>').text(data.user + ": " + data.msg));
  });

  socket.on('logged-in', function (data) {
      console.log(data.user + " has logged in.");
	  $('#messages').append($('<li>').text(data.user + " has logged in."));
  });

  socket.on('logged-out', function (data) {
      console.log(data.user + " has logged out.");
	  $('#messages').append($('<li>').text(data.user + " has logged out."));
  });

  $(function() {
    // Connect to the server
	socket.emit('connect', {});
	
	// Login to the server
	var person = prompt("[TEMPORARY] Please enter your username", "Guest" + Math.floor((Math.random() * 10) + 1));
	socket.emit('login', {user:person});
	
	// Register a function to handle the chat
	$('form').submit(function(){
		var temp_data = {};
		temp_data.user = person;
		temp_data.msg = $('#m').val();
		socket.emit('msg', temp_data);
		$('#m').val('');
		return false;
	  });

  });

});
