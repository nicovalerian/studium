import mammoth from 'mammoth';

const MAX_CONTENT_LENGTH = 90000;
const MIN_TEXT_LENGTH = 10;

export async function extractTextFromDocx(buffer: ArrayBuffer): Promise<string> {
  const result = await mammoth.extractRawText({ arrayBuffer: buffer });
  const text = result.value;

  if (text.trim().length < MIN_TEXT_LENGTH) {
    throw new Error('This document appears to be empty or contains only images.');
  }

  if (text.length > MAX_CONTENT_LENGTH) {
    return text.slice(0, MAX_CONTENT_LENGTH);
  }

  return text;
}

export function wasTruncated(text: string): boolean {
  return text.length >= MAX_CONTENT_LENGTH;
}
