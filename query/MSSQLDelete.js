'use strict';

require('insulin').factory('ndm_MSSQLDelete',
  ['ndm_Delete'], ndm_MSSQLDeleteProducer);

function ndm_MSSQLDeleteProducer(Delete) {
  /**
   * A representation of a MSSQL DELETE query.
   * @extends Delete
   */
  class MSSQLDelete extends Delete {
    /**
     * Build the query.
     * @return {Query~QueryMeta} The string-representation of the query to
     * execute along with query parameters.
     */
    buildQuery() {
      const fromAlias = this.escaper.escapeProperty(this._delTableMeta.as);
      const from      = this._from.toString();

      return {
        sql:    `DELETE  ${fromAlias}\n${from}`,
        params: this._from.paramList.params
      };
    }
  }

  return MSSQLDelete;
}

