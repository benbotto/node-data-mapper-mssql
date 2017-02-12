'use strict';

require('insulin').factory('ndm_MSSQLUpdateModel',
  ['ndm_UpdateModel', 'ndm_MSSQLUpdate'], ndm_MSSQLUpdateModelProducer);

function ndm_MSSQLUpdateModelProducer(UpdateModel, MSSQLUpdate) {
  /**
   * A Query class specialized for updating models by ID.
   * @extends UpdateModel
   */
  class MSSQLUpdateModel extends UpdateModel {
    /**
     * Create a MSSQLUpdate instance.
     * @param {ModelTraverse~ModelMeta} meta - A meta object as created by the
     * modelTraverse class.
     * @return {MSSQLUpdate} A MSSQLUpdate Query instance representing the
     * query.
     */
    createQuery(meta) {
      const upd = super.createQuery(meta);

      return new MSSQLUpdate(upd._from, upd._model);
    }
  }

  return MSSQLUpdateModel;
}

