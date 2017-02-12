describe('MSSQLEscaper()', function() {
  'use strict';

  const insulin      = require('insulin');
  const Escaper      = insulin.get('ndm_Escaper');
  const MSSQLEscaper = insulin.get('ndm_MSSQLEscaper');
  const escaper      = new MSSQLEscaper();

  /**
   * Ctor.
   */
  describe('.constructor().', function() {
    it('extends Escaper.', function() {
      expect(escaper instanceof Escaper).toBe(true);
      expect(escaper instanceof MSSQLEscaper).toBe(true);
    });
  });

  /**
   * Escape property.
   */
  describe('.escapeProperty()', function() {
    it('escapes strings.', function() {
      expect(escaper.escapeProperty('name')).toBe('`name`');
    });

    it('preserves dots.', function() {
      expect(escaper.escapeProperty('my.name')).toBe('`my.name`');
    });
  });

  /**
   * Escape FQC.
   */
  describe('.escapeFullqyQualifiedColumn()', function() {
    // Escapes a fully-qualified column.
    it('escapes the table and the column independently.', function() {
      expect(escaper.escapeFullyQualifiedColumn('users.firstName')).toBe('`users`.`firstName`');
      expect(escaper.escapeFullyQualifiedColumn('users.first.Name')).toBe('`users`.`first.Name`');
      expect(escaper.escapeFullyQualifiedColumn('phone_numbers.phoneNumber')).toBe('`phone_numbers`.`phoneNumber`');
      expect(escaper.escapeFullyQualifiedColumn('phoneNumber')).toBe('`phoneNumber`');
    });
  });
});

