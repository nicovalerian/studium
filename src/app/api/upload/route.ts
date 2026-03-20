import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { extractText, getFileType, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from '@/lib/file-processing';
import { generateDocumentEmbeddings } from '@/lib/embeddings/generate';
import { EMAIL_VERIFICATION_REQUIRED_ERROR_CODE } from '@/lib/auth/access';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user.email_confirmed_at) {
    return NextResponse.json(
      { error: 'Email verification required', code: EMAIL_VERIFICATION_REQUIRED_ERROR_CODE },
      { status: 403 }
    );
  }

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  const classId = formData.get('class_id') as string | null;

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (!classId) {
    return NextResponse.json({ error: 'No class_id provided' }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Invalid file type. Only PDF and DOCX files are allowed.' },
      { status: 400 }
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 });
  }

  const fileType = getFileType(file.type);
  if (!fileType) {
    return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  let extractedText: string;
  let wasTruncated = false;

  try {
    const buffer = await file.arrayBuffer();
    const result = await extractText(buffer, fileType);
    extractedText = result.text;
    wasTruncated = result.wasTruncated;
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : 'Could not read this file. It may be corrupted or password-protected.';
    return NextResponse.json({ error: message }, { status: 400 });
  }

  const documentId = crypto.randomUUID();
  const filePath = `${user.id}/${documentId}/${file.name}`;

  const { error: storageError } = await supabase.storage.from('documents').upload(filePath, file);

  if (storageError) {
    console.error('Storage upload error:', storageError);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }

  const { error: insertError } = await supabase.from('documents').insert({
    id: documentId,
    class_id: classId,
    user_id: user.id,
    filename: file.name,
    file_path: filePath,
    file_size: file.size,
    content: extractedText,
    embedding_status: 'pending',
  });

  if (insertError) {
    console.error('Document insert error:', insertError);
    await supabase.storage.from('documents').remove([filePath]);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
  try {
    const embeddingResult = await generateDocumentEmbeddings(supabase, documentId, extractedText);

    return NextResponse.json({
      document_id: documentId,
      embedding_status: embeddingResult.embedding_status,
      error_message: embeddingResult.error_message,
      was_truncated: wasTruncated,
    });
  } catch (error) {
    console.error('Embedding generation error:', error);
    return NextResponse.json({ error: 'Failed to process document embeddings' }, { status: 500 });
  }
}
