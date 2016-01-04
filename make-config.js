/* jshint node: true */
"use strict";

require('./shared/polyfills.js').polyfill();

var prompt = require('prompt'),
    DBManager = require('./server/mire/managers/dbmanager.js'),
    ConfigManager = require('./server/mire/managers/configmanager.js');

prompt.message = '';
prompt.delimiter = '';

var schema = {
  properties: {
    iphost: {
      description: 'Enter the hostname for the node server',
      required: true,
      default: '127.0.0.1'
    },
    port: {
      description: 'Enter the port for the node server',
      required: true,
      default: 8173
    }
  }
};

console.log('Welcome to the Mire configuration editor!\n');

prompt.start();

prompt.get(schema, function (err, result) {
  if (err) {
    console.error('\n\nOK. Configuration not saved.\n');
  } else {
    var dbMgr = new DBManager({});

    var configMgr = new ConfigManager({}, dbMgr);

    configMgr.setHost(result.iphost);
    configMgr.setPort(result.port);

    dbMgr.compact("config");

    console.log("\n\nConfiguration successfully written!\n");
  }
});
