'use strict';

require('insulin').factory('ndm_MSSQLDataContext',
  ['ndm_DataContext', 'ndm_MSSQLEscaper', 'ndm_MSSQLQueryExecuter',
   'ndm_MSSQLInsert', 'ndm_MSSQLFromAdapter', 'ndm_MSSQLUpdateModel',
   'ndm_MSSQLDeleteModel'],
  ndm_MSSQLDataContextProducer);

function ndm_MSSQLDataContextProducer(DataContext, MSSQLEscaper, MSSQLQueryExecuter,
  MSSQLInsert, MSSQLFromAdapter, MSSQLUpdateModel, MSSQLDeleteModel) {
  /** 
   * A MSSQL-specialized DataContext.
   * @extends DatContext
   */
  class MSSQLDataContext extends DataContext {
    /**
     * @param {Database} database - A Database instance to query.
     * @param {Object} pool - A MSSQL connection pool instance (or a single
     * connection).  It is the user's responsibility to end the pool when the
     * application closes.  See {@link
     * https://github.com/patriksimek/node-mssql#configuration-1}
     */
    constructor(database, pool) {
      super(database, new MSSQLEscaper(), new MSSQLQueryExecuter(pool));
    }

    /**
     * Create a new {@link MSSQLInsert} instance.
     * @param {Object} model - See the {@link MSSQLInsert} constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {MSSQLInsert} An MSSQLInsert instance.
     */
    insert(model, database) {
      database = database || this.database;
      return new MSSQLInsert(database, this.escaper, this.queryExecuter, model);
    }

    /**
     * Create a new {@link MSSQLFromAdapter} instance, which can then be used to
     * SELECT, DELETE, or UPDATE.
     * @see MSSQLFromAdapter
     * @see From
     * @param {TableMetaList~TableMeta|string} meta - See the {@link From}
     * constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {MSSQLFromAdapter} A MSSQLFromAdapter instance.
     */
    from(meta, database) {
      database = database || this.database;
      return new MSSQLFromAdapter(database, this.escaper, this.queryExecuter, meta);
    }

    /**
     * Create a new {@link MSSQLUpdateModel} instance that can be used to
     * UPDATE a model by ID.  For complex UPDATE operations, use the {@link
     * DataContext#from} method to obtain a {@link FromAdapter} instance, and
     * then call {@link FromAdapter#update} on that instance.
     * @param {Object} model - See the {@link UpdateModel} constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {MSSQLUpdateModel} A MSSQLUpdateModel instance.
     */
    update(model, database) {
      database = database || this.database;
      return new MSSQLUpdateModel(database, this.escaper, this.queryExecuter, model);
    }

    /**
     * Create a new {@link MSSQLDeleteModel} instance that can be used to
     * delete a model by ID.  For complex DELETE operations, use the {@link
     * DataContext#from} method to obtain a {@link FromAdapter} instance, and
     * then call {@link FromAdapter#delete} on that instance.
     * @param {Object} model - See the {@link DeleteModel} constructor.
     * @param {Database} [database] - An optional Database instance.  If
     * passed, this parameter is used instead of the Database that's provided
     * to the ctor.
     * @return {MSSQLDeleteModel} A MSSQLDeleteModel instance.
     */
    delete(model, database) {
      database = database || this.database;
      return new MSSQLDeleteModel(database, this.escaper, this.queryExecuter, model);
    }

    /**
     * Shortcut to end the connection.
     * @return {void}
     */
    end() {
      this.queryExecuter.pool.end();
    }
  }

  return MSSQLDataContext;
}

