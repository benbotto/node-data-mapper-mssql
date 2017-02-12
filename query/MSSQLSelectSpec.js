xdescribe('MSSQLSelect()', function() {
  'use strict';

  const insulin      = require('insulin').mock();
  const MSSQLSelect  = insulin.get('ndm_MSSQLSelect');
  const MSSQLEscaper = insulin.get('ndm_MSSQLEscaper');
  const escaper      = new MSSQLEscaper();
  let db, qryExec;

  beforeEach(function() {
    qryExec = jasmine.createSpyObj('qryExec', ['select']);
    db      = insulin.get('ndm_testDB');
  });

  function getFrom(meta) {
    const From = insulin.get('ndm_From');
    return new From(db, escaper, qryExec, meta);
  }

  /**
   * Ctor.
   */
  xdescribe('.constructor()', function() {
    it('extends Select.', function() {
      const Select = insulin.get('ndm_Select');
      const query  = new MSSQLSelect(getFrom('users'), qryExec);

      expect(query instanceof Select).toBe(true);
    });
  });

  /**
   * Build query.
   */
  xdescribe('.buildQuery()', function() {
    it('selects all columns if columns are not explicitly selected.', function() {
      const query     = new MSSQLSelect(getFrom('users'), qryExec);
      const queryMeta = query.buildQuery();

      expect(queryMeta.sql).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n'       +
        '        `users`.`firstName` AS `users.firstName`,\n' +
        '        `users`.`lastName` AS `users.lastName`\n'    +
        'FROM    `users` AS `users`');
    });

    it('allows tables to be aliased.', function() {
      const query = new MSSQLSelect(getFrom({table: 'users', as: 'admins'}), qryExec);

      expect(query.toString()).toBe(
        'SELECT  `admins`.`userID` AS `admins.userID`,\n'       +
        '        `admins`.`firstName` AS `admins.firstName`,\n' +
        '        `admins`.`lastName` AS `admins.lastName`\n'    +
        'FROM    `users` AS `admins`');
    });
      
    it('lets columns be selected explicitly.', function() {
      const query = new MSSQLSelect(getFrom('users'), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName');
      const queryMeta = query.buildQuery();

      expect(queryMeta.sql).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n'       +
        '        `users`.`firstName` AS `users.firstName`,\n' +
        '        `users`.`lastName` AS `users.lastName`\n'    +
        'FROM    `users` AS `users`');
    });

    it('includes the ORDER BY.', function() {
      const query = new MSSQLSelect(getFrom('users'), qryExec)
        .select('users.userID', 'users.firstName', 'users.lastName')
        .orderBy('users.firstName');
      const queryMeta = query.buildQuery();

      expect(queryMeta.sql).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n'       +
        '        `users`.`firstName` AS `users.firstName`,\n' +
        '        `users`.`lastName` AS `users.lastName`\n'    +
        'FROM    `users` AS `users`\n'                        +
        'ORDER BY `users`.`firstName` ASC');
    });

    it('builds the list of parameters from the From instance.', function() {
      const from = getFrom('users')
        .where({$eq: {'users.firstName': ':name'}}, {name: 'Joe'});
      const query = new MSSQLSelect(from, qryExec)
        .select('users.userID', 'users.firstName');
      const queryMeta = query.buildQuery();

      expect(queryMeta.sql).toBe(
        'SELECT  `users`.`userID` AS `users.userID`,\n'      +
        '        `users`.`firstName` AS `users.firstName`\n' +
        'FROM    `users` AS `users`\n'                       +
        'WHERE   `users`.`firstName` = :name');
      
      expect(queryMeta.params).toEqual({name: 'Joe'});
    });
  });
});

