import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const documentIds: string[] = body.document_ids;

  if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
    return NextResponse.json({ error: 'No document IDs provided' }, { status: 400 });
  }

  const { data: documents, error: fetchError } = await supabase
    .from('documents')
    .select('id, file_path')
    .in('id', documentIds)
    .eq('user_id', user.id);

  if (fetchError) {
    console.error('Error fetching documents:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }

  if (!documents || documents.length === 0) {
    return NextResponse.json({ error: 'No documents found' }, { status: 404 });
  }

  const validDocumentIds = documents.map((d) => d.id);
  const filePaths = documents.map((d) => d.file_path).filter(Boolean) as string[];

  const { error: chunksError } = await supabase
    .from('document_chunks')
    .delete()
    .in('document_id', validDocumentIds);

  if (chunksError) {
    console.error('Error deleting document chunks:', chunksError);
  }

  const { error: docsError } = await supabase.from('documents').delete().in('id', validDocumentIds);

  if (docsError) {
    console.error('Error deleting documents:', docsError);
    return NextResponse.json({ error: 'Failed to delete documents' }, { status: 500 });
  }

  if (filePaths.length > 0) {
    const { error: storageError } = await supabase.storage.from('documents').remove(filePaths);

    if (storageError) {
      console.error('Error deleting files from storage:', storageError);
    }
  }

  return NextResponse.json({ success: true, deleted_count: validDocumentIds.length });
}
