'use strict';

require('insulin').factory('ndm_MSSQLDriver',
  ['deferred', 'mssql', 'ndm_MSSQLDataContext', 'ndm_MSSQLSchemaGenerator',
  'ndm_Database'],
  ndm_MSSQLDriverProducer);

function ndm_MSSQLDriverProducer(deferred, mssql, MSSQLDataContext,
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
      this.conOpts     = conOpts;

      /**
       * A MSSQLSchemaGenerator instance.  The user can attach event handlers
       * to the ADD_TABLE and ADD_COLUMN events.
       * @type {MSSQLSchemaGenerator}
       * @name MSSQLDriver#generator
       * @public
       */
      this.generator = new MSSQLSchemaGenerator(mssql);
    }

    /**
     * Initialize the database schema, connection pool, and Datacontext
     * instance.
     * @param {String} [schema='dbo'] - The schema for which the schema should
     * be generated.
     * @return {Promise<DataContext>} A Promise that is resolved with a
     * DataContext instance, which can be used for querying the database.
     */
    initialize(schema = 'dbo') {
      // Connect.
      return deferred(mssql.connect(this.conOpts))
        // Generate the schema, then create the DataContext instance.
        .then(() => this.generator.generateSchema(this.conOpts.database, 'dbo'))
        .then(schema => {
          // The DataContext instance is stored locally for convenient access.
          this.dataContext = new MSSQLDataContext(new Database(schema), mssql);

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

