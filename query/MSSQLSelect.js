'use strict';

require('insulin').factory('ndm_MSSQLSelect', ['ndm_Select'], ndm_MSSQLSelectProducer);

function ndm_MSSQLSelectProducer(Select) {
  /**
   * Represents a SELECT query for MSSQL.
   * @extends Select
   */
  class MSSQLSelect extends Select {
    /**
     * Build the query.
     * @return {Query~QueryMeta} The string-representation of the query to
     * execute along with query parameters.
     */
    buildQuery() {
      const queryMeta = {};
      let   cols;

      // Build the SQL.
      queryMeta.sql = 'SELECT  ';

      // No columns specified.  Get all columns.
      if (this._selectCols.size === 0)
        this.selectAll();

      // Escape each selected column and add it to the query.
      cols = Array.from(this._selectCols.values());
      queryMeta.sql += cols.map(function(col) {
        const colName  = this.escaper.escapeProperty(col.column.name);
        const colAlias = this.escaper.escapeProperty(col.fqColName);
        const tblAlias = this.escaper.escapeProperty(col.tableAlias);

        return `${tblAlias}.${colName} AS ${colAlias}`;
      }, this).join(',\n        ');

      // Add the FROM (which includes the JOINS and WHERE).
      queryMeta.sql += '\n';
      queryMeta.sql += this._from.toString();

      // Add the order.
      if (this._orderBy.length !== 0) {
        queryMeta.sql += '\n';
        queryMeta.sql += 'ORDER BY ';
        queryMeta.sql += this._orderBy.join(', ');
      }

      // Add the parameters.
      queryMeta.params = this._from.paramList.params;

      return queryMeta;
    }
  }

  return MSSQLSelect;
}

