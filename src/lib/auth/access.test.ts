import { describe, expect, it } from 'vitest';
import { buildLoginHref, getSafeNextPath } from './access';

describe('auth access helpers', () => {
  it('keeps safe in-app next paths', () => {
    expect(getSafeNextPath('/class/abc')).toBe('/class/abc');
    expect(getSafeNextPath('/class/abc?tab=flashcards')).toBe('/class/abc?tab=flashcards');
  });

  it('falls back for missing or protocol-relative next paths', () => {
    expect(getSafeNextPath(undefined)).toBe('/dashboard');
    expect(getSafeNextPath('https://evil.test')).toBe('/dashboard');
    expect(getSafeNextPath('//evil.test')).toBe('/dashboard');
  });

  it('builds login URLs with a sanitized next path', () => {
    expect(buildLoginHref('/class/abc')).toBe('/login?next=%2Fclass%2Fabc');
    expect(buildLoginHref('//evil.test', 'signup')).toBe('/login?next=%2Fdashboard&mode=signup');
  });
});
