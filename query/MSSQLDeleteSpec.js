describe('MSSQLDelete()', function() {
  'use strict';

  const insulin      = require('insulin');
  const MSSQLDelete  = insulin.get('ndm_MSSQLDelete');
  const From         = insulin.get('ndm_From');
  const MSSQLEscaper = insulin.get('ndm_MSSQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MSSQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['delete']));

  function getFrom(meta) {
    return new From(db, escaper, qryExec, meta);
  }

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends Delete.', function() {
      const del    = new MSSQLDelete(getFrom('users'));
      const Delete = insulin.get('ndm_Delete');

      expect(del instanceof Delete).toBe(true);
    });
  });

  /**
   * Build query.
   */
  describe('.buildQuery()', function() {
    it('builds a valid DELETE statment with parameters from the From instance.', function() {
      const from      = getFrom('users u')
        .where({$eq: {'u.userID': ':userID'}}, {userID: 42});
      const del       = new MSSQLDelete(from);
      const queryMeta = del.buildQuery();

      expect(queryMeta.sql).toBe(
        'DELETE  [u]\n' +
        'FROM    [users] AS [u]\n' +
        'WHERE   [u].[userID] = :userID'
      );

      expect(queryMeta.params).toEqual({
        userID: 42
      });
    });

    it('can use a table alias to delete from a joined in table.', function() {
      const from      = getFrom('users u')
        .innerJoin('u.phone_numbers pn')
        .where({$eq: {'u.userID': ':userID'}}, {userID: 42});
      const del       = new MSSQLDelete(from, 'pn');
      const queryMeta = del.buildQuery();

      expect(queryMeta.sql).toBe(
        'DELETE  [pn]\n' +
        'FROM    [users] AS [u]\n' +
        'INNER JOIN [phone_numbers] AS [pn] ON [u].[userID] = [pn].[userID]\n' +
        'WHERE   [u].[userID] = :userID'
      );

      expect(queryMeta.params).toEqual({
        userID: 42
      });
    });
  });
});

