describe('MSSQLFromAdapter()', function() {
  'use strict';

  const insulin          = require('insulin');
  const MSSQLFromAdapter = insulin.get('ndm_MSSQLFromAdapter');
  const MSSQLEscaper     = insulin.get('ndm_MSSQLEscaper');
  const db               = insulin.get('ndm_testDB');
  const escaper          = new MSSQLEscaper();
  let   qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['select', 'delete']));

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends FromAdapter.', function() {
      const FromAdapter = insulin.get('ndm_FromAdapter');
      const fa          = new MSSQLFromAdapter(db, escaper, qryExec, 'users u');

      expect(fa instanceof FromAdapter).toBe(true);
      expect(fa.database).toBe(db);
      expect(fa.queryExecuter).toBe(qryExec);
      expect(fa.escaper).toBe(escaper);
    });
  });

  /**
   * Select.
   */
  describe('.select().', function() {
    it('returns a MSSQLSelect instance.', function() {
      const MSSQLSelect = insulin.get('ndm_MSSQLSelect');
      const sel         = new MSSQLFromAdapter(db, escaper, qryExec, {table: 'users'})
        .select();

      expect(sel instanceof MSSQLSelect).toBe(true);
    });

    it('selects all columns by default.', function() {
      const sel = new MSSQLFromAdapter(db, escaper, qryExec, {table: 'users'})
        .select();

      expect(sel.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n' +
        '        `users`.`firstName` AS `users.firstName`,\n' +
        '        `users`.`lastName` AS `users.lastName`\n' +
        'FROM    `users` AS `users`');
    });

    it('can be passed columns explicitly.', function() {
      const sel = new MSSQLFromAdapter(db, escaper, qryExec, {table: 'users'})
        .select('users.userID', 'users.firstName');

      expect(sel.toString()).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n' +
        '        `users`.`firstName` AS `users.firstName`\n' +
        'FROM    `users` AS `users`');
    });
  });

  /**
   * Delete.
   */
  describe('.delete()', function() {
    it('returns a MSSQLDelete instance.', function() {
      const MSSQLDelete = insulin.get('ndm_MSSQLDelete');
      const del         = new MSSQLFromAdapter(db, escaper, qryExec, 'users')
        .where({$eq: {'users.userID': 1}})
        .delete();

      expect(del instanceof MSSQLDelete).toBe(true);
    });

    it('can be provided an optional table alias.', function() {
      const del    = new MSSQLFromAdapter(db, escaper, qryExec, 'users u')
        .where({$eq: {'u.userID': 1}})
        .innerJoin('u.phone_numbers pn')
        .delete('pn');

      expect(del.toString()).toBe(
        'DELETE  `pn`\n' +
        'FROM    `users` AS `u`\n' +
        'INNER JOIN `phone_numbers` AS `pn` ON `u`.`userID` = `pn`.`userID`\n' + 
        'WHERE   `u`.`userID` = 1');
    });
  });

  /**
   * Update.
   */
  describe('.update()', function() {
    it('returns a MSSQLUpdate instance.', function() {
      const MSSQLUpdate = insulin.get('ndm_MSSQLUpdate');
      const upd         = new MSSQLFromAdapter(db, escaper, qryExec, 'users u')
        .update({'u.firstName': 'Joe'});

      expect(upd instanceof MSSQLUpdate).toBe(true);
    });

    it('passes the model to the Update constructor.', function() {
      const upd = new MSSQLFromAdapter(db, escaper, qryExec, 'users u')
        .where({$eq: {'u.userID': 1}})
        .update({'u.firstName': 'Joe'});

      expect(upd.toString()).toBe(
        'UPDATE  `users` AS `u`\n' +
        'SET\n' +
        '`u`.`firstName` = :u_firstName_0\n' +
        'WHERE   `u`.`userID` = 1');
    });
  });
});

