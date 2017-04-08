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
     * @param {Object} pool - The mssql object in a connected state.
     * It's the user's responsibility to close this connection.
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
     * Prepare the parameters.  NDM parameters start with a colon, but in
     * MSSQL they need to start with an at symbol.
     * @private
     * @param {string} query - The SQL to execute.
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     */
    _prepareParameters(query, params) {
      for (let key in params) {
        // Note: this could cause some problems if there are words containing
        // the key, for example if a table had a column containing a colon.
        query = query.replace(new RegExp(`:${key}`, 'g'), `@${key}`);
      }

      return query;
    }

    /**
     * Prepare the request object.
     * @private
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     */
    _prepareRequest(params) {
      const request = new this.pool.Request();

      for (let key in params)
        request.input(key, params[key]);

      return request;
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
      this
        ._prepareRequest(params)
        .query(this._prepareParameters(query, params), callback);
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
      const request = this._prepareRequest(params);
      let   sql     = this._prepareParameters(query, params);

      // The query needs to get the newly inserted ID if it is an IDENTITY.
      sql += '\nSELECT  SCOPE_IDENTITY() AS insertId';

      request.query(sql, onQuery);

      function onQuery(err, res) {
        if (err)
          callback(err);
        else {
          // The result is an object with insertId set.  It will be null if
          // the primary key of the table is not an IDENTITY.
          callback(null, res[0]);
        }
      }
    }

    /**
     * Private helper for updating or deleting, which do the same
     * thing and return the same structure.
     * @private
     * @param {string} query - The SQL to execute.
     * @param {Object} params - An object containing query parameters for the
     * query.  Each parameter will be preceded with a colon in query.
     * @param {QueryExecuter~mutateCallback} callback - A callback function
     * that is called after the query is executed.
     * @return {void}
     */
    _mutate(query, params, callback) {
      this
        ._prepareRequest(params)
        .query(this._prepareParameters(query, params), onQuery);

      function onQuery(err, res, affectedRows) {
        if (err)
          callback(err);
        else {
          // The result is an object with an affectedRows property.
          callback(null, {affectedRows});
        }
      }
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
      this._mutate(query, params, callback);
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
      this._mutate(query, params, callback);
    }
  }

  return MSSQLQueryExecuter;
}

