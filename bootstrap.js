'use strict';

/**
 * This script sets up the dependency injection container, insulin.
 */
const insulin = require('insulin');
const scripts = (require('./grunt/scriptGarner.js'))().app;

// Static dependencies.
insulin.factory('mssql', () => require('mssql'))

// node-data-mapper registers itself with insulin under the ndm namespace.
require('node-data-mapper');
require('ndm-schema-generator-mssql');

// Application (dynamic) dependencies.
scripts.forEach(script => require(script));

// Export the list of files.
module.exports = scripts;

