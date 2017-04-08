describe('MSSQLQueryExecuter()', function() {
  'use strict';

  const insulin            = require('insulin');
  const MSSQLQueryExecuter = insulin.get('ndm_MSSQLQueryExecuter');
  let qe, con, request;

  beforeEach(function() {
    // Mocked node-mssql and request.
    con     = jasmine.createSpyObj('mssql', ['Request']);
    request = jasmine.createSpyObj('request', ['input', 'query']);

    con.Request.and.returnValue(request);

    qe = new MSSQLQueryExecuter(con);
  });

  /**
   * Ctor.
   */
  describe('.constructor()', function() {
    it('extends QueryExecuter.', function() {
      const QueryExecuter = insulin.get('ndm_QueryExecuter');

      expect(qe instanceof QueryExecuter).toBe(true);
    });

    it('exposes a "pool" object.', function() {
      expect(qe.pool).toBe(con);
    });
  });

  /**
   * Private _prepareParameters method.
   */
  describe('._prepareParameters()', function() {
    it('does nothing if there are no parameters.', function() {
      const sql = 'SELECT * FROM users';

      expect(qe._prepareParameters(sql, {})).toBe('SELECT * FROM users');
    });
    
    it('makes each parameter start with an at symbol.', function() {
      const sql = `
        SELECT  u.userID, :not-replaced
        FROM    users u
        WHERE   u.name = :name
          AND   u.age  > :age
          AND   u.age  < :age`;
      const params = {name: 'Foo', age: 1};

      expect(qe._prepareParameters(sql, params)).toBe(`
        SELECT  u.userID, :not-replaced
        FROM    users u
        WHERE   u.name = @name
          AND   u.age  > @age
          AND   u.age  < @age`);
    });
  });

  /**
   * Private _prepareRequest method.
   */
  describe('._prepareRequest()', function() {
    it('returns a request object.', function() {
      const req = qe._prepareRequest({});

      expect(req).toBe(request);
      expect(req.input).not.toHaveBeenCalled();
    });

    it('adds each parameter as input.', function() {
      const req = qe._prepareRequest({name: 'Joe', age: 30});

      expect(req).toBe(request);
      expect(req.input.calls.argsFor(0)).toEqual(['name', 'Joe']);
      expect(req.input.calls.argsFor(1)).toEqual(['age', 30]);
    });
  });

  /**
   * Select.
   */
  describe('.select()', function() {
    it('executes the prepared request and query.', function() {
      const sql = `
        SELECT  u.userID
        FROM    users u
        WHERE   u.name = :name`;
      const params = {name: 'Foo'};
      const cb     = {}; // Not called, just checked by ref.

      qe.select(sql, params, cb);

      const args = request.query.calls.argsFor(0);

      expect(args[0]).toBe(`
        SELECT  u.userID
        FROM    users u
        WHERE   u.name = @name`);
      expect(args[1]).toBe(cb);
    });
  });

  /**
   * Insert.
   */
  describe('.insert()', function() {
    it('executes the prepared request and query.', function() {
      const sql = `
        INSERT INTO bikes (brand, model, msrp)
        VALUES (:b, :m, :msrp)`;
      const params = {b: 'Huffy', m: 'PoS', msrp: 129};
      
      qe.insert(sql, params);

      const args = request.query.calls.argsFor(0);

      // Adds the ID check.
      expect(args[0].indexOf('SELECT  SCOPE_IDENTITY() AS insertId')).not.toBe(-1);
    });

    it('passes the error to the callback if an error occurs.', function() {
      const err = new Error();
      const cb  = jasmine.createSpy('cb');

      request.query.and.callFake((query, callback) => callback(err));
      qe.insert('', {}, cb);
      expect(cb).toHaveBeenCalledWith(err);
    });

    it('returns the insertId.', function() {
      const cb = jasmine.createSpy('cb');

      // query() returns an array, but the QE returns the first row which
      // has the insertId.
      request.query.and.callFake((query, callback) =>
        callback(null, [{insertId: 42}]));

      qe.insert('', {}, cb);
      expect(cb.calls.argsFor(0)).toEqual([null, {insertId: 42}]);
    });
  });

  /**
   * Private mutate, which is used by delete and update.
   */
  describe('._mutate()', function() {
    it('passes the error to the callback if an error occurs.', function() {
      const err = new Error();
      const cb  = jasmine.createSpy('cb');

      request.query.and.callFake((query, callback) => callback(err));
      qe._mutate('', {}, cb);
      expect(cb).toHaveBeenCalledWith(err);
    });

    it('returns the affectedRows.', function() {
      const cb = jasmine.createSpy('cb');

      // query() returns three parameters.  Third is the number of rows affected.
      request.query.and.callFake((query, callback) =>
        callback(null, null, 4));

      qe._mutate('', {}, cb);
      expect(cb.calls.argsFor(0)).toEqual([null, {affectedRows: 4}]);
    });
  });

  /**
   * Delete.
   */
  describe('.delete()', function() {
    it('executes the perpared request and query.', function() {
      const sql    = `
        DELETE FROM users
        WHERE  userID = :uid`;
      const params = {uid: 12};
      const cb     = {};

      qe.delete(sql, params, cb);
      expect(request.query.calls.argsFor(0)[0]).toBe(`
        DELETE FROM users
        WHERE  userID = @uid`);
      expect(request.input.calls.argsFor(0)).toEqual(['uid', 12]);
    });
  });

  /**
   * Update.
   */
  describe('.update()', function() {
    it('executes the perpared request and query.', function() {
      const sql    = `
        UPDATE users SET
        name = :n`;
      const params = {n: 'Joe'};
      const cb     = {};

      qe.delete(sql, params, cb);
      expect(request.query.calls.argsFor(0)[0]).toBe(`
        UPDATE users SET
        name = @n`);
      expect(request.input.calls.argsFor(0)).toEqual(['n',  'Joe']);
    });
  });
});

