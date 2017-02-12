'use strict';

const ndm         = require('node-data-mapper');
const ndm_mssql   = require('node-data-mapper-mssql');
const MSSQLDriver = ndm_mssql.MSSQLDriver;

const driver = new MSSQLDriver({
  host:            'localhost',
  user:            'example',
  password:        'secret',
  database:        'bike_shop',
  connectionLimit: 10
});

driver.generator.on('ADD_TABLE',  onAddTable);
driver.generator.on('ADD_COLUMN', onAddColumn);

driver
  .initialize()
  .then(function(dataContext) {
    console.log('Ready to execute queries.');

    // Disconnect (driver.end() also works).
    dataContext.end();
  })
  .catch(err => console.error('ERROR', err));

/**
 * The table mapping (mapTo) removes any underscores and uppercases the
 * proceeding character.  Ex: bike_shop_bikes => bikeShopBikes
 * @param {Table} table - An ndm.Table instance with a name property.
 * @return {void}
 */
function onAddTable(table) {
  table.mapTo = table.name.replace(/_[a-z]/g, (c) => c.substr(1).toUpperCase());
}

/**
 * Set up each column.
 * @param {Column} col - An ndm.Column instance with name, mapTo, dataType,
 * columnType, isNullable, maxLength, and isPrimary properties.
 * @param {Table} table - An ndm.Table object with name and mapTo properties.
 * @return {void}
 */
function onAddColumn(col, table) {
  // Add a converter based on the type.
  if (col.dataType === 'bit')
    col.converter = ndm.bitConverter;
}

