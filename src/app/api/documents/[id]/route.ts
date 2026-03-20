import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { EMAIL_VERIFICATION_REQUIRED_ERROR_CODE } from '@/lib/auth/access';

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id: documentId } = await params;
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

  const { data: document, error: fetchError } = await supabase
    .from('documents')
    .select('id, file_path, user_id')
    .eq('id', documentId)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !document) {
    return NextResponse.json({ error: 'Document not found' }, { status: 404 });
  }

  const { error: chunksError } = await supabase
    .from('document_chunks')
    .delete()
    .eq('document_id', documentId);

  if (chunksError) {
    console.error('Error deleting document chunks:', chunksError);
  }

  const { error: docError } = await supabase.from('documents').delete().eq('id', documentId);

  if (docError) {
    console.error('Error deleting document:', docError);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }

  if (document.file_path) {
    const { error: storageError } = await supabase.storage
      .from('documents')
      .remove([document.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
    }
  }

  return NextResponse.json({ success: true });
}
