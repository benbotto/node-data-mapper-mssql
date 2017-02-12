describe('MSSQLUpdate()', function() {
  'use strict';

  const insulin      = require('insulin');
  const MSSQLUpdate  = insulin.get('ndm_MSSQLUpdate');
  const From         = insulin.get('ndm_From');
  const MSSQLEscaper = insulin.get('ndm_MSSQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MSSQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['update']));

  function getFrom(meta) {
    return new From(db, escaper, qryExec, meta);
  }

  /**
   * Constructor.
   */
  describe('.constructor()', function() {
    it('extends Update.', function() {
      const Update = insulin.get('ndm_Update');
      const upd    = new MSSQLUpdate(getFrom('users u'), {'u.firstName': 'jack'});

      expect(upd instanceof Update).toBe(true);
      expect(upd.database).toBeDefined();
      expect(upd.escaper).toBeDefined();
      expect(upd.queryExecuter).toBeDefined();
    });
  });

  /**
   * Build query
   */
  describe('.buildQuery()', function() {
    it('returns null if there are no columns to update.', function() {
      const upd = new MSSQLUpdate(getFrom('users u'), {});

      expect(upd.buildQuery()).toBeNull();
    });

    it('returns a valid SQL string and params if there is only one column to update.', function() {
      const upd = new MSSQLUpdate(getFrom('users u'), {
        'u.firstName': 'Joe'
      });
      const queryMeta = upd.buildQuery();

      expect(queryMeta.sql).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n'+
        '`u`.`firstName` = :u_firstName_0');

      expect(queryMeta.params).toEqual({
        u_firstName_0: 'Joe'
      });
    });

    it('returns a valid SQL string and params if there are multiple columns.', function() {
      const upd = new MSSQLUpdate(getFrom('users u'), {
        'u.lastName':  "O'Hare",
        'u.firstName': 'Joe'
      });
      const queryMeta = upd.buildQuery();

      expect(queryMeta.sql).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n'+
        '`u`.`lastName` = :u_lastName_0,\n' +
        '`u`.`firstName` = :u_firstName_1');

      expect(queryMeta.params).toEqual({
        u_lastName_0:  "O'Hare",
        u_firstName_1: 'Joe'
      });
    });

    it('returns a valid SQL string if a WHERE clause is provided.', function() {
      const from = getFrom('users u')
        .where({$eq: {'u.userID': ':userID'}}, {userID: 12});
      const upd  = new MSSQLUpdate(from, {
        'u.firstName': 'Joe'
      });
      const queryMeta = upd.buildQuery();

      expect(queryMeta.sql).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n'+
        '`u`.`firstName` = :u_firstName_0\n' +
        'WHERE   `u`.`userID` = :userID');

      expect(queryMeta.params).toEqual({
        u_firstName_0: 'Joe',
        userID:        12
      });
    });

    it('returns a valid SQL string if a JOIN is provided.', function() {
      const from = getFrom('users u')
        .innerJoin('u.phone_numbers pn')
        .where({$eq: {'u.userID': 12}});
      const upd  = new MSSQLUpdate(from, {
        'u.firstName':    'Joe',
        'pn.phoneNumber': '123-456-789'
      });
      const queryMeta = upd.buildQuery();

      expect(queryMeta.sql).toBe(
        'UPDATE  `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' +
        'SET\n'+
        '`u`.`firstName` = :u_firstName_0,\n' +
        '`pn`.`phoneNumber` = :pn_phoneNumber_1\n' +
        'WHERE   `u`.`userID` = 12');
    });

    it('uses onSave converters that are defined in the Database instance.', function() {
      const upd = new MSSQLUpdate(getFrom('products p'), {
        'p.isActive': false
      });
      const queryMeta = upd.buildQuery();

      expect(queryMeta.params).toEqual({
        p_isActive_0: 0
      });
    });
  });
});

