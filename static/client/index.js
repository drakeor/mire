/// <reference path="./babylon.js" />
/// <reference path="./jquery.js" />

"use strict";

requirejs.config({
  "baseUrl": "client",
  "paths": {
    "shared": "shared",
    "socket.io": "../socket.io/socket.io"
  },
  },
  "urlArgs": "bust=" + (new Date()).getTime()
});

requirejs(['client']);
