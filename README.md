# Project: Mire

## Overview

Project Mire is split into three sections of independent projects located in the same source
repository. These projects are `Server`, `Shared`, and `Client` located in the respective
directories: `/server`, `/shared`, and `/static`. The `Server` project is a node web-socket server
and only works on node. The `Shared` project is Javascript code that will function irrespective of
a browser or node target (and may be included in either). Finally, the `Client` project consists
of code, markup, and CSS that is intended to be delivered to the browser. This project is intended
to be platform independent http-server-wise; however, only NGINX configuration scripts exist. All of
the other miscellaneous directories in version control are used by the `Server` project.

## Server

The Project Mire server is a node.js web-socket server that uses Socket.IO as the web-socket
implementation library. Project Mire, by default, uses port 8173. Mnemonic for memorization of the
port is `mIrE` where the m is an 8, the I is a 1, the r is a 7 and the E is a 3.

### Configuration of the Server

If you wish to setup the server for the first time you will need to start by installing the required
`npm` packages. Just cd to the root project directory and call `npm install`. After that is done,
you will need to configure the Mire Server.

The Mire Server uses a persistence library named NeDB. That persistence library is where the
configuration data is stored. However, you will need to setup this configuration data before
running the server, otherwise it will default to using `127.0.0.1:8173` for the server. To configure
Mire, just run: `node ./make-config.js` in the root project directory and follow the prompt.

After that, you should be ready to run the Node Server. Note that you will still need to setup the
static http server; however, that is unrelated to the `Server` project (See the `Client` project).

### Directory Structure

In order to run the node server, you execute `node ./mire.js` in the root project directory. That
script in turn will include the ./server/mire.js file which defines the Server Application object.
The Server Application object will then include all the managers the server uses to run Mire.

The directory structure and some critical source files are listed below:

<pre>
mire.js                         -- Server Main Source File.

server/
├── mire                        -- All server DBO and manager files are found in this directory.
│   ├── dbo.js                  -- This file contains an include for every DBO lib file.
│   ├── lib                     -- This directory ancillary source files required by managers.
│   └── managers                -- This directory contains managers.
└── mire.js

world_core/                     -- This directory contains all the Core World Files.
├── coremanager.js
├── entities                    -- Core Entities
├── room                        -- Core Rooms
└── verb                        -- Core Verbs

world_custom/                   -- This directory contains all the Custom World Files.
├── custommanager.js
├── entities                    -- Custom Entities
├── room                        -- Custom Rooms
└── verb                        -- Custom Verbs
</pre>

### World Files

An integral part of Mire is the World Files. These are split into Core and Custom. Core world files
ship with the MIRE MUD engine itself and the engine cannot work without it. Custom files should
not be sent with the MUD. Any verbs and rooms included in custom should not be viewed as integral
parts of the MUD and the server should function without them.
