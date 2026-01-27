import { extractText as extractPdfText } from 'unpdf';

const MAX_CONTENT_LENGTH = 90000;
const MIN_TEXT_LENGTH = 50;

export async function extractTextFromPdf(buffer: ArrayBuffer): Promise<string> {
  const result = await extractPdfText(buffer);
  const text = Array.isArray(result.text) ? result.text.join('\n') : result.text;

  if (text.trim().length < MIN_TEXT_LENGTH) {
    throw new Error(
      'Could not extract text from this PDF. It may be a scanned document. Please upload a text-based PDF.'
    );
  }

  if (text.length > MAX_CONTENT_LENGTH) {
    return text.slice(0, MAX_CONTENT_LENGTH);
  }

  return text;
}

export function wasTruncated(text: string): boolean {
  return text.length >= MAX_CONTENT_LENGTH;
}
