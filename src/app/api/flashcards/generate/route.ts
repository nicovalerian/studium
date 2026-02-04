import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { generateFlashcards } from '@/lib/flashcards/generator';

const MAX_CONTENT_LENGTH = 8000;
const MIN_CONTENT_LENGTH = 200;

export async function POST(request: Request) {
  const supabase = await createClient();
  const requestId = crypto.randomUUID();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { class_id?: string; document_id?: string };
  try {
    body = await request.json();
  } catch (error) {
    console.error('Flashcards invalid JSON:', { requestId, error });
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  const { class_id, document_id } = body;

  if (!class_id) {
    return NextResponse.json({ error: 'class_id is required' }, { status: 400 });
  }

  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', class_id)
    .single();

  if (classError || !classData) {
    if (classError) {
      console.error('Flashcards class fetch error:', {
        requestId,
        classId: class_id,
        userId: user.id,
        error: classError,
      });
    }
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  let documents;

  if (document_id) {
    const { data, error } = await supabase
      .from('documents')
      .select('id, filename, display_name, content, embedding_status')
      .eq('id', document_id)
      .eq('class_id', class_id)
      .single();

    if (error || !data) {
      if (error) {
        console.error('Flashcards document fetch error:', {
          requestId,
          classId: class_id,
          documentId: document_id,
          userId: user.id,
          error,
        });
      }
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (data.embedding_status !== 'completed') {
      return NextResponse.json(
        { error: 'Document is still processing. Please wait.' },
        { status: 400 }
      );
    }

    documents = [data];
  } else {
    const { data, error } = await supabase
      .from('documents')
      .select('id, filename, display_name, content, embedding_status')
      .eq('class_id', class_id)
      .eq('embedding_status', 'completed')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Flashcards documents fetch error:', {
        requestId,
        classId: class_id,
        userId: user.id,
        error,
      });
      return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      const { count, error: countError } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('class_id', class_id);

      if (countError) {
        console.error('Flashcards documents count error:', {
          requestId,
          classId: class_id,
          userId: user.id,
          error: countError,
        });
        return NextResponse.json({ error: 'Failed to count documents' }, { status: 500 });
      }

      if (count === 0) {
        return NextResponse.json(
          { error: 'No documents available. Upload a document first.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: 'Documents are still processing. Please wait.' },
        { status: 400 }
      );
    }

    documents = data;
  }

  let combinedContent = '';
  const sourceDocuments: string[] = [];

  for (const doc of documents) {
    if (combinedContent.length >= MAX_CONTENT_LENGTH) break;

    const docName = doc.display_name || doc.filename;
    sourceDocuments.push(docName);

    const remaining = MAX_CONTENT_LENGTH - combinedContent.length;
    const contentToAdd = doc.content.slice(0, remaining);
    combinedContent += contentToAdd + '\n\n';
  }

  combinedContent = combinedContent.trim();

  if (combinedContent.length < MIN_CONTENT_LENGTH) {
    return NextResponse.json(
      { error: 'Not enough content to generate flashcards.' },
      { status: 400 }
    );
  }

  const result = await generateFlashcards(combinedContent);

  if ('error' in result) {
    console.error('Flashcards generation error:', {
      requestId,
      classId: class_id,
      userId: user.id,
      error: result.error,
    });
    return NextResponse.json({ error: result.error }, { status: 500 });
  }

  const flashcardsToInsert = result.flashcards.map((card) => ({
    class_id,
    user_id: user.id,
    front: card.front,
    back: card.back,
  }));

  const { data: insertedCards, error: insertError } = await supabase
    .from('flashcards')
    .insert(flashcardsToInsert)
    .select('id, front, back');

  if (insertError) {
    console.error('Flashcards insert error:', {
      requestId,
      classId: class_id,
      userId: user.id,
      error: insertError,
    });
    return NextResponse.json({ error: 'Failed to save flashcards' }, { status: 500 });
  }

  return NextResponse.json({
    flashcards: insertedCards,
    source_documents: sourceDocuments,
  });
}
