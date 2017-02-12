'use strict';

require('insulin').factory('ndm_MSSQLInsert',
  ['ndm_ModelTraverse', 'ndm_Insert', 'ndm_ParameterList'],
  ndm_MSSQLInsertProducer);

function ndm_MSSQLInsertProducer(ModelTraverse, Insert, ParameterList) {
  /**
   * A Query class that represents an INSERT query for MSSQL.  Instances of the
   * class can be used to insert models in a database.
   * @extends Insert
   */
  class MSSQLInsert extends Insert {
    /**
     * Build the query.
     * @return {Query~QueryMeta} The string-representation of the query to
     * execute along with query parameters, and a meta object as returned
     * from the ModelTraverse.modelOnly() method.
     */
    buildQuery() {
      const self     = this;
      const queries  = [];
      const traverse = new ModelTraverse();

      // Traverse the model and build a QueryMeta object for each model.
      traverse.modelOnly(this._model, buildSingle, this.database);

      function buildSingle(meta) {
        const table     = self.database.getTableByMapping(meta.tableMapping);
        const tableName = self.escaper.escapeProperty(table.name);
        const cols      = [];
        const paramKeys = [];
        const paramList = new ParameterList();
        const queryMeta = {};

        for (let colMapping in meta.model) {
          // If the property is not a table mapping it is ignored.  (The model
          // can have extra user-defined data.)
          if (table.isColumnMapping(colMapping)) {
            // Mappings are used in the model, but the column name is needed for
            // an insert statement.
            const col      = table.getColumnByMapping(colMapping);
            const colName  = self.escaper.escapeProperty(col.name);
            const paramKey = `:${colMapping}`; 
            let   colVal = meta.model[colMapping];

            // Transform the column if needed (e.g. from a boolean to a bit).
            if (col.converter.onSave)
              colVal = col.converter.onSave(colVal);

            cols.push(colName);
            paramKeys.push(paramKey);
            paramList.addParameter(colMapping, colVal);
          }
        }

        // If there are no columns/values to insert, just exit.
        if (!cols.length)
          return;

        // Build the meta object and add it to the list.
        queryMeta.modelMeta = meta;
        queryMeta.sql =
          `INSERT INTO ${tableName} (${cols.join(', ')})\n` +
          `VALUES (${paramKeys.join(', ')})`;
        queryMeta.params = paramList.params;

        queries.push(queryMeta);
      }

      return queries;
    }
  }

  return MSSQLInsert;
}

