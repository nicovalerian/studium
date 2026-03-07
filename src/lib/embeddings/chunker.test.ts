import { describe, expect, it } from 'vitest';
import { chunkText } from './chunker';
import { sanitizeUnpairedSurrogates } from './unicode';

function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}

describe('embedding unicode safety', () => {
  it('replaces unpaired surrogates with replacement characters', () => {
    const textWithInvalidPairs = 'A\uD83DB\uDE00C';
    const sanitized = sanitizeUnpairedSurrogates(textWithInvalidPairs);

    expect(sanitized).toBe('A\uFFFDB\uFFFDC');
  });

  it('never splits a surrogate pair at chunk boundaries', () => {
    const text = `${'a'.repeat(1999)}??${'b'.repeat(50)}`;
    const chunks = chunkText(text);

    expect(chunks.length).toBeGreaterThan(1);

    for (const chunk of chunks) {
      const firstCodeUnit = chunk.charCodeAt(0);
      const lastCodeUnit = chunk.charCodeAt(chunk.length - 1);

      expect(isLowSurrogate(firstCodeUnit)).toBe(false);
      expect(isHighSurrogate(lastCodeUnit)).toBe(false);
    }
  });
});
