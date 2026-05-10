import { describe, it, expect } from 'vitest';
import { generateId, getToday, formatDate, truncate } from './utils';

describe('utils', () => {
  describe('generateId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('getToday', () => {
    it('should return date in YYYY-MM-DD format', () => {
      const today = getToday();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('formatDate', () => {
    it('should format today as "今天"', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(formatDate(today)).toBe('今天');
    });

    it('should format yesterday as "昨天"', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      expect(formatDate(yesterday)).toBe('昨天');
    });
  });

  describe('truncate', () => {
    it('should not truncate short text', () => {
      expect(truncate('hello', 10)).toBe('hello');
    });

    it('should truncate long text with ellipsis', () => {
      expect(truncate('hello world', 8)).toBe('hello...');
    });
  });
});
