import { sanitizeUnpairedSurrogates } from './unicode';

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}

function makeEndBoundarySafe(text: string, end: number): number {
  if (end <= 0 || end >= text.length) return end;

  const prev = text.charCodeAt(end - 1);
  const next = text.charCodeAt(end);

  if (isHighSurrogate(prev) && isLowSurrogate(next)) {
    return end - 1;
  }

  return end;
}

function makeStartBoundarySafe(text: string, start: number): number {
  if (start <= 0 || start >= text.length) return start;

  const prev = text.charCodeAt(start - 1);
  const current = text.charCodeAt(start);

  if (isHighSurrogate(prev) && isLowSurrogate(current)) {
    return start + 1;
  }

  return start;
}

export function chunkText(text: string): string[] {
  const cleanedText = sanitizeUnpairedSurrogates(text);
  const chunks: string[] = [];
  let start = 0;

  while (start < cleanedText.length) {
    const unsafeEnd = Math.min(start + CHUNK_SIZE, cleanedText.length);
    const end = makeEndBoundarySafe(cleanedText, unsafeEnd);
    chunks.push(cleanedText.slice(start, end));

    const nextStart = start + CHUNK_SIZE - CHUNK_OVERLAP;
    start = makeStartBoundarySafe(cleanedText, nextStart);
  }

  return chunks;
}
