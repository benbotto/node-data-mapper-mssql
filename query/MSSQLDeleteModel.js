'use strict';

require('insulin').factory('ndm_MSSQLDeleteModel',
  ['ndm_MSSQLDelete', 'ndm_DeleteModel'], ndm_MSSQLDeleteModelProducer);

function ndm_MSSQLDeleteModelProducer(MSSQLDelete, DeleteModel) {
  /**
   * A Query class that allows for quickly deleting of models by ID.
   * @extends DeleteModel
   */
  class MSSQLDeleteModel extends DeleteModel {
    /**
     * Create a MSSQLDelete instance.
     * @param {ModelTraverse~ModelMeta} meta - A meta object as created by the
     * modelTraverse class.
     * @return {MSSQLDelete} A MSSQLDelete Query instance representing the DELETE query.
     */
    createQuery(meta) {
      const del = super.createQuery(meta);
      return new MSSQLDelete(del._from);
    }
  }

  return MSSQLDeleteModel;
}

