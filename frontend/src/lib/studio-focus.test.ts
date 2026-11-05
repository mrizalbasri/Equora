import { describe, expect, it } from 'vitest';
import { focusedWeights } from './studio-focus';

describe('focusedWeights', () => {
  it('assigns 70 percent to the focus and preserves a total of 100', () => {
    const result = focusedWeights(['a', 'b', 'c', 'd'], 'c');
    expect(result).toEqual({ a: 10, b: 10, c: 70, d: 10 });
    expect(Object.values(result ?? {}).reduce((sum, value) => sum + value, 0)).toBe(100);
  });

  it('distributes integer remainders in indicator order', () => {
    expect(focusedWeights(['a', 'b', 'c'], 'a')).toEqual({ a: 70, b: 15, c: 15 });
    expect(focusedWeights(['a', 'b'], 'b')).toEqual({ a: 30, b: 70 });
    expect(focusedWeights(['a', 'b', 'c', 'd', 'e'], 'a')).toEqual({
      a: 70,
      b: 8,
      c: 8,
      d: 7,
      e: 7,
    });
  });

  it('handles one indicator and rejects an unknown focus', () => {
    expect(focusedWeights(['a'], 'a')).toEqual({ a: 100 });
    expect(focusedWeights(['a', 'b'], 'missing')).toBeNull();
    expect(focusedWeights([], 'a')).toBeNull();
  });
});
