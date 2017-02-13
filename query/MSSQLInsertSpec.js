describe('MSSQLInsert()', function() {
  'use strict';

  const insulin      = require('insulin');
  const MSSQLInsert  = insulin.get('ndm_MSSQLInsert');
  const MSSQLEscaper = insulin.get('ndm_MSSQLEscaper');
  const db           = insulin.get('ndm_testDB');
  const escaper      = new MSSQLEscaper();
  let qryExec;

  beforeEach(() => qryExec = jasmine.createSpyObj('qryExec', ['insert']));

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends INsert.', function() {
      const Insert = insulin.get('ndm_Insert');
      const ins    = new MSSQLInsert(db, escaper, qryExec, {});

      expect(ins instanceof Insert).toBe(true);
    });
  });

  /**
   * Build query.
   */
  describe('.buildQuery()', function() {
    it('generates SQL and parameters for a single model.', function() {
      const query = new MSSQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins'}
      });
      const queryMeta = query.buildQuery();

      expect(queryMeta.length).toBe(1);
      expect(queryMeta[0].sql).toEqual(
        'INSERT INTO [users] ([firstName], [lastName])\n' +
        'VALUES (:first, :last)');
      expect(queryMeta[0].params).toEqual({
        first: 'Sandy',
        last:  'Perkins'
      });
    });

    it('returns an empty array if there are no columns to insert.', function() {
      const query     = new MSSQLInsert(db, escaper, qryExec, {users: {}});
      const queryMeta = query.buildQuery();

      expect(queryMeta.length).toBe(0);
    });

    it('ignores nested model properties that don\'t map to columns.', function() {
      const query = new MSSQLInsert(db, escaper, qryExec, {
        users: {first: 'Sandy', last: 'Perkins', occupation: 'Code Wrangler'}
      });
      const queryMeta = query.buildQuery();

      expect(queryMeta[0].sql).toEqual(
        'INSERT INTO [users] ([firstName], [lastName])\n' +
        'VALUES (:first, :last)');
      expect(queryMeta[0].params).toEqual({
        first: 'Sandy',
        last:  'Perkins'
      });
    });

    it('generates a query for each model in an array.', function() {
      const query = new MSSQLInsert(db, escaper, qryExec, {
        users: [
          {first: 'Sandy', last: 'Perkins'},
          {first: 'Sandy', last: "O'Hare"}
        ]
      });
      const queryMeta = query.buildQuery();

      expect(queryMeta.length).toBe(2);

      expect(queryMeta[0].sql).toEqual(
        'INSERT INTO [users] ([firstName], [lastName])\n' +
        'VALUES (:first, :last)');
      expect(queryMeta[1].sql).toEqual(
        'INSERT INTO [users] ([firstName], [lastName])\n' +
        'VALUES (:first, :last)');

      expect(queryMeta[0].params).toEqual({
        first: 'Sandy',
        last:  'Perkins'
      });
      expect(queryMeta[1].params).toEqual({
        first: 'Sandy',
        last:  "O'Hare"
      });
    });

    it('uses converters when present in the Database instance.', function() {
      const query = new MSSQLInsert(db, escaper, qryExec, {
        products: {isActive: true}
      });
      const queryMeta = query.buildQuery();

      expect(queryMeta[0].params).toEqual({
        isActive: 1
      });
    });
  });
});

