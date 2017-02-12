'use strict';

require('insulin').factory('ndm_MSSQLQueryExecuter',
  ['ndm_QueryExecuter'], ndm_MSSQLQueryExecuterProducer);

function ndm_MSSQLQueryExecuterProducer(QueryExecuter) {
  /**
   * A QueryExecuter extensions specialized for MSSQL.
   */
  class MSSQLQueryExecuter extends QueryExecuter {
    /**
     * Initialize the QueryExecuter instance.
     * @param {Object} pool - A MSSQL connection pool instance (or a single
     * connection).  It is the user's responsibility to end the pool when the
     * application closes.
     */
    constructor(pool) {
      super();

      /**
       * A MSSQL connection pool instance.
       * @type {Object}
       * @name MSSQLQueryExecuter#pool
       * @see {@link https://github.com/patriksimek/node-mssql#configuration-1}
       * @public
       */
      this.pool = pool;
    }

    /**
     * Execute a select query.
     * @param {string} query - The SQL to execute.
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     * @param {QueryExecuter~selectCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    select(query, params, callback) {
      this.pool.query(query, params, callback);
    }

    /**
     * Execute an insert query.
     * @param {string} query - The SQL to execute.
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     * @param {QueryExecuter~insertCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    insert(query, params, callback) {
      this.pool.query(query, params, callback);
    }

    /**
     * Execute an update query.
     * @param {string} query - The SQL to execute.
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    update(query, params, callback) {
      this.pool.query(query, params, callback);
    }

    /**
     * Execute a delete query.
     * @param {string} query - The SQL to execute.
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    delete(query, params, callback) {
      this.pool.query(query, params, callback);
    }
  }

  return MSSQLQueryExecuter;
}

