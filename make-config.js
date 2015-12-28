/* jshint node: true */
"use strict";

var prompt = require('prompt'),
    fs = require('fs'),
    path = require('path'),
    replaceStream = require('replacestream');

var configTemplate = path.join(__dirname, 'tpl/config/default-config.tpl');
var outputConfig = path.join(__dirname, 'config.js');

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
      default: 5345
    }
  }
};

console.log('Welcome to the Mire configuration editor!\n');

prompt.start();

prompt.get(schema, function (err, result) {
  if (err) {
    console.error('\n\nOK. Configuration not saved.\n');
  } else {
    var outputFS = fs.createWriteStream(outputConfig);

    fs.createReadStream(configTemplate)
      .pipe(replaceStream('_HOST_', result.iphost))
      .pipe(replaceStream('_PORT_', result.port))
      .pipe(outputFS);

    console.log("\n\nConfiguration successfully written!\n");
  }
});
