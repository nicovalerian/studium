import { extractTextFromPdf, wasTruncated as pdfTruncated } from './pdf';
import { extractTextFromDocx, wasTruncated as docxTruncated } from './docx';

export type FileType = 'pdf' | 'docx';

export interface ExtractionResult {
  text: string;
  wasTruncated: boolean;
}

export function getFileType(mimeType: string): FileType | null {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    return 'docx';
  return null;
}

export async function extractText(buffer: ArrayBuffer, fileType: FileType): Promise<ExtractionResult> {
  let text: string;

  if (fileType === 'pdf') {
    text = await extractTextFromPdf(buffer);
    return { text, wasTruncated: pdfTruncated(text) };
  }

  text = await extractTextFromDocx(buffer);
  return { text, wasTruncated: docxTruncated(text) };
}

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
