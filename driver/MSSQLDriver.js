'use strict';

require('insulin').factory('ndm_MSSQLDriver',
  ['mssql', 'ndm_MSSQLDataContext', 'ndm_informationSchemaDatabase',
  'ndm_MSSQLSchemaGenerator', 'ndm_Database'],
  ndm_MSSQLDriverProducer);

function ndm_MSSQLDriverProducer(mssql, MSSQLDataContext, isDB,
  MSSQLSchemaGenerator, Database) {
  /**
   * A MSSQL Driver for the node-data-mapper ORM.
   */
  class MSSQLDriver {
    /**
     * Initialize the driver.
     * @param {Object} conOpts - An object containing connection options
     * suitable for the mssql constructor ({@link
     * https://github.com/patriksimek/node-mssql}).
     */
    constructor(conOpts) {
      this.dataContext = null;

      // Copy the connection options locally and add the queryFormat function
      // (node-data-mapper uses :param format).
      this.conOpts = Object.assign({}, conOpts, {queryFormat});

      // Create a DataContext instance for the information_schema database.
      const isConOpts = Object.assign({}, this.conOpts, {database: 'information_schema'});
      const isCon     = mssql.createConnection(isConOpts);
      const isDC      = new MSSQLDataContext(isDB, isCon);

      /**
       * A MSSQLSchemaGenerator instance.  The user can attach event handlers
       * to the ADD_TABLE and ADD_COLUMN events.
       * @type {MSSQLSchemaGenerator}
       * @name MSSQLDriver#generator
       * @public
       */
      this.generator = new MSSQLSchemaGenerator(isDC);

      // Custom parameter escaping.  Comes directly from here:
      // https://github.com/mssqljs/mssql#custom-format
      function queryFormat(query, values) {
        if (!values)
          return query;

        return query.replace(/\:(\w+)/g, (txt, key) => {
          // "this" is a Connection instance with an escape() function.
          if (values.hasOwnProperty(key)) {
            return this.escape(values[key]);
          }

          return txt;
        });
      }
    }

    /**
     * Initialize the database schema, connection pool, and Datacontext
     * instance.
     * @return {Promise<DataContext>} A Promise that is resolved with a
     * DataContext instance, which can be used for querying the database.
     */
    initialize() {
      // Generate the schema, then create the DataContext instance.
      return this.generator
        .generateSchema(this.conOpts.database)
        .then(schema => {
          // The DataContext instance is stored locally for convenient access.
          this.dataContext = new MSSQLDataContext(new Database(schema), mssql.createPool(this.conOpts));

          // Resolve with the DC.
          return this.dataContext;
        });
    }

    /**
     * Shortcut method for ending the connection.
     * @return {void}
     */
    end() {
      if (this.dataContext)
        this.dataContext.end();
    }
  }

  return MSSQLDriver;
}

