import { describe, it, expect } from 'vitest';
import { normalizeUrl, jaccardSimilarity, isDuplicate } from './dedup';

describe('dedup', () => {
  describe('normalizeUrl', () => {
    it('should remove protocol', () => {
      expect(normalizeUrl('https://github.com/user/repo')).toBe('github.com/user/repo');
      expect(normalizeUrl('http://github.com/user/repo')).toBe('github.com/user/repo');
    });

    it('should remove www prefix', () => {
      expect(normalizeUrl('https://www.github.com/user/repo')).toBe('github.com/user/repo');
    });

    it('should remove trailing slash', () => {
      expect(normalizeUrl('https://github.com/user/repo/')).toBe('github.com/user/repo');
    });

    it('should remove query parameters', () => {
      expect(normalizeUrl('https://github.com/user/repo?ref=main')).toBe('github.com/user/repo');
    });
  });

  describe('jaccardSimilarity', () => {
    it('should return 1 for identical strings', () => {
      expect(jaccardSimilarity('hello world', 'hello world')).toBe(1);
    });

    it('should return 0 for completely different strings', () => {
      expect(jaccardSimilarity('abc', 'xyz')).toBe(0);
    });

    it('should calculate correct similarity for similar strings', () => {
      const sim = jaccardSimilarity('hello world', 'hello there world');
      expect(sim).toBeGreaterThan(0);
      expect(sim).toBeLessThan(1);
    });

    it('should handle empty strings', () => {
      expect(jaccardSimilarity('', '')).toBe(0);
      expect(jaccardSimilarity('hello', '')).toBe(0);
    });
  });

  describe('isDuplicate', () => {
    const existing = [
      { url: 'https://github.com/user/repo', title: 'Test Repo', description: 'A test repo' },
    ];

    it('should detect URL duplicate', () => {
      const item = { url: 'https://github.com/user/repo', title: 'Different Title', description: 'Different desc' };
      expect(isDuplicate(item, existing)).toBe(true);
    });

    it('should detect similar content', () => {
      const item = { url: 'https://github.com/user/repo2', title: 'Test Repo', description: 'A test repo' };
      expect(isDuplicate(item, existing)).toBe(true);
    });

    it('should not flag different content', () => {
      const item = { url: 'https://github.com/other/repo', title: 'Different Project', description: 'Completely different' };
      expect(isDuplicate(item, existing)).toBe(false);
    });
  });
});
