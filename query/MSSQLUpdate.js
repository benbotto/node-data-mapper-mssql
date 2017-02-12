'use strict';

require('insulin').factory('ndm_MSSQLUpdate',
  ['ndm_Update', 'ndm_assert', 'ndm_ParameterList'],
  ndm_MSSQLUpdateProducer);

function ndm_MSSQLUpdateProducer(Update, assert, ParameterList) {
  /**
   * A Query that represents an UPDATE statement in MSSQL.
   * @extends Update
   */
  class MSSQLUpdate extends Update {
    /**
     * Build the query.
     * @return {Query~QueryMeta} The string-representation of the query to
     * execute along with query parameters.
     */
    buildQuery() {
      const update    = this._from.getFromString().replace(/^FROM  /, 'UPDATE');
      const joins     = this._from.getJoinString();
      const where     = this._from.getWhereString();
      const sets      = [];
      const paramList = new ParameterList(this._from.paramList);
      const queryMeta = {};
      let   set;

      // Add each key in the model as a query parameter.
      for (let fqColName in this._model) {
        const col       = this._from._tableMetaList.availableCols.get(fqColName).column;
        const colName   = this.escaper.escapeFullyQualifiedColumn(fqColName);
        const paramName = paramList.createParameterName(fqColName);
        let   paramVal  = this._model[fqColName];

        // The column may need to be transformed (e.g. from a boolean to a bit).
        if (col.converter.onSave)
          paramVal = col.converter.onSave(paramVal);

        paramList.addParameter(paramName, paramVal);

        // Add the set string for the column.
        sets.push(`${colName} = :${paramName}`);
      }

      // Add the parameters.
      queryMeta.params = paramList.params;

      // No columns to update.
      if (sets.length === 0)
        return null;

      set = 'SET\n' + sets.join(',\n');

      // Build the SQL.
      queryMeta.sql = [update, joins, set, where]
        .filter(part => part !== '')
        .join('\n');

      return queryMeta;
    }
  }

  return MSSQLUpdate;
}

