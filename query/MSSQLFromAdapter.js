'use strict';

require('insulin').factory('ndm_MSSQLFromAdapter',
  ['ndm_FromAdapter', 'ndm_MSSQLSelect', 'ndm_MSSQLUpdate', 'ndm_MSSQLDelete'],
  ndm_MSSQLFromAdapterProducer);

function ndm_MSSQLFromAdapterProducer(FromAdapter, MSSQLSelect, MSSQLUpdate, MSSQLDelete) {
  /**
   * An specialization of the FromAdapter class for MSSQL.
   * @extends FromAdapter
   */
  class MSSQLFromAdapter extends FromAdapter {
    /**
     * Select from the table.
     * @see Select#select
     * @param {...(object|string)} [cols] - An optional set of columns to select.
     * @return {MSSQLSelect} A MSSQLSelect instance that can be executed.
     */
    select(...cols) {
      const sel = new MSSQLSelect(this, this._queryExecuter);

      // This has to be applied because cols is optional.  If cols is not passed,
      // calling sel.select(cols) would pass undefined to select().
      return sel.select.apply(sel, cols);
    }

    /**
     * Delete from the table.
     * @param {string} [tableAlias] - The unique alias of the table from which
     * records will be deleted.  Optional, defaults to the alias of the from
     * table.
     * @return {MSSQLDelete} A MSSQLDelete instance that can be executed.
     */
    delete(tableAlias) {
      return new MSSQLDelete(this, tableAlias);
    }

    /**
     * Update a table.
     * @param {Object} model - The model describing what to update.
     * @see Update
     * @return {MSSQLUpdate} A MSSQLUpdate instance that can be executed.
     */
    update(model) {
      return new MSSQLUpdate(this, model);
    }
  }

  return MSSQLFromAdapter;
}

