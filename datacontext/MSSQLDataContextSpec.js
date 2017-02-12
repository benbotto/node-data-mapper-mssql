describe('MSSQLDataContext()', function() {
  'use strict';

  const insulin          = require('insulin');
  const MSSQLDataContext = insulin.get('ndm_MSSQLDataContext');
  const db               = insulin.get('ndm_testDB');
  const pool             = {};

  // Helper function to "clone" the db instance.
  function cloneDB() {
    const Database = insulin.get('ndm_Database');

    return new Database(JSON.parse(JSON.stringify(db)));
  }

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends DataContext.', function() {
      const dc          = new MSSQLDataContext(db, pool);
      const DataContext = insulin.get('ndm_DataContext');

      expect(dc instanceof DataContext).toBe(true);
    });

    it('passes the pool to the MSSQLQueryExecuter constructor.', function() {
      const dc = new MSSQLDataContext(db, pool);
      expect(dc.queryExecuter.pool).toBe(pool);
    });
  });

  /**
   * Insert.
   */
  describe('.insert()', function() {
    it('returns an MSSQLInsert instance.', function() {
      const dc          = new MSSQLDataContext(db, pool);
      const insert      = dc.insert({});
      const MSSQLInsert = insulin.get('ndm_MSSQLInsert');

      expect(insert instanceof MSSQLInsert).toBe(true);
    });

    it('accepts an optional database argument, and passes it to the MSSQLInsert ctor.', function() {
      const dc     = new MSSQLDataContext(db, pool);
      const db2    = cloneDB();
      const insert = dc.insert({}, db2);

      expect(insert.database).toBe(db2);
    });
  });

  /**
   * From.
   */
  describe('.from()', function() {
    it('returns a MSSQLFromAdapter instance.', function() {
      const dc               = new MSSQLDataContext(db, pool);
      const from             = dc.from({table: 'users'});
      const MSSQLFromAdapter = insulin.get('ndm_MSSQLFromAdapter');

      expect(from instanceof MSSQLFromAdapter).toBe(true);
    });

    it('accepts an optional database argument, and passes it to the MSSQLFromAdapter ctor.',
      function() {
      const dc   = new MSSQLDataContext(db, pool);
      const db2  = cloneDB();
      const from = dc.from({table: 'users'}, db2);

      expect(from.database).toBe(db2);
    });
  });

  /**
   * Update.
   */
  describe('.update()', function() {
    it('returns a MSSQLUpdateModel instance.', function() {
      const dc               = new MSSQLDataContext(db, pool);
      const del              = dc.update({});
      const MSSQLUpdateModel = insulin.get('ndm_MSSQLUpdateModel');

      expect(del instanceof MSSQLUpdateModel).toBe(true);
    });

    it('accepts an optional database argument, and passes it to the ' +
      'MSSQLUpdateModel ctor.', function() {
      const dc  = new MSSQLDataContext(db, pool);
      const db2 = cloneDB();
      const del = dc.update({}, db2);

      expect(del.database).toBe(db2);
    });
  });

  /**
   * Delete.
   */
  describe('.delete()', function() {
    it('returns a MSSQLDeleteModel instance.', function() {
      const dc               = new MSSQLDataContext(db, pool);
      const del              = dc.delete({});
      const MSSQLDeleteModel = insulin.get('ndm_MSSQLDeleteModel');

      expect(del instanceof MSSQLDeleteModel).toBe(true);
    });

    it('accepts an optional database argument, and passes it to the ' +
      'MSSQLDeleteModel ctor.', function() {
      const dc  = new MSSQLDataContext(db, pool);
      const db2 = cloneDB();
      const del = dc.delete({}, db2);

      expect(del.database).toBe(db2);
    });
  });

  /**
   * End.
   */
  describe('.end()', function() {
    it('calls end on the queryExecuter\'s pool.', function() {
      const pool = jasmine.createSpyObj('pool', ['end']);
      const dc   = new MSSQLDataContext(db, pool);

      dc.end();
      expect(pool.end).toHaveBeenCalled();
    });
  });
});

