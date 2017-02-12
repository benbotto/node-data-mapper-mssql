'use strict';

require('insulin').factory('ndm_MSSQLEscaper',
  ['mssql', 'ndm_Escaper'], ndm_MSSQLEscaperProducer);

function ndm_MSSQLEscaperProducer(mssql, Escaper) {
  /**
   * Helper class for escaping parts of a query under MSSQL.
   * @extends Escaper
   */
  class MSSQLEscaper extends Escaper {
    /**
     * Initialize the escaper.
     */
    constructor() {
      super();
    }

    /**
     * Escape a property, such as a table, column name, or alias.
     * @param {string} prop - The property to escape.
     * @return {string} The escaped property.
     */
    escapeProperty(prop) {
      return mssql.escapeId(prop, true);
    }
  }

  return MSSQLEscaper;
}

