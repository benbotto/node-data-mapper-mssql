  xdescribe('MSSQLUpdateModel()', function() {
  'use strict';

  const insulin          = require('insulin');
  const MSSQLUpdateModel = insulin.get('ndm_MSSQLUpdateModel');
  const MSSQLEscaper     = insulin.get('ndm_MSSQLEscaper');
  const db               = insulin.get('ndm_testDB');
  const escaper          = new MSSQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['update']));

  /**
   * Create query.
   */
  xdescribe('.createQuery()', function() {
    it('returns valid SQL and parameters.', function() {
      const upd = new MSSQLUpdateModel(db, escaper, qryExec, {
        users: {
          ID:    1,
          first: 'Joe',
          last:  'Smith'
        }
      });

      qryExec.update.and.callFake(function(query, params) {
        expect(query).toBe(
          'UPDATE  `users` AS `users`\n' +
          'SET\n' +
          '`users`.`firstName` = :users_firstName_1,\n' +
          '`users`.`lastName` = :users_lastName_2\n' +
          'WHERE   (`users`.`userID` = :users_userID_0)'
        );

        expect(params).toEqual({
          users_userID_0:    1,
          users_firstName_1: 'Joe',
          users_lastName_2:  'Smith'
        });
      });

      upd.execute();
    });
  });
});

