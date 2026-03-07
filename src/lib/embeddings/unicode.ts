function isHighSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xd800 && codeUnit <= 0xdbff;
}

function isLowSurrogate(codeUnit: number): boolean {
  return codeUnit >= 0xdc00 && codeUnit <= 0xdfff;
}

export function sanitizeUnpairedSurrogates(text: string): string {
  if (!text) return text;

  let result = '';

  for (let i = 0; i < text.length; i++) {
    const current = text.charCodeAt(i);

    if (isHighSurrogate(current)) {
      const next = i + 1 < text.length ? text.charCodeAt(i + 1) : -1;
      if (isLowSurrogate(next)) {
        result += text[i] + text[i + 1];
        i++;
      } else {
        result += '\uFFFD';
      }
      continue;
    }

    if (isLowSurrogate(current)) {
      result += '\uFFFD';
      continue;
    }

    result += text[i];
  }

  return result;
}
