import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { chat } from '@/lib/ai/service';
import { searchSimilarChunks, buildContext } from '@/lib/embeddings/search';
import type { ChatMessage } from '@/lib/ai/types';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data, error: userError } = await supabase.auth.getUser();
  const user = data?.user;

  if (userError) {
    console.error('Auth error:', userError);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: { class_id?: string; message?: string };
  const requestId = crypto.randomUUID();
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { class_id, message } = body;

  if (!class_id) {
    return NextResponse.json({ error: 'class_id is required' }, { status: 400 });
  }

  if (!message || typeof message !== 'string') {
    return NextResponse.json({ error: 'message is required' }, { status: 400 });
  }

  if (message.length > 5000) {
    return NextResponse.json({ error: 'Message must be 5000 characters or less' }, { status: 400 });
  }

  try {
    const { data: classData, error: classError } = await supabase
      .from('classes')
      .select('id')
      .eq('id', class_id)
      .single();

    if (classError || !classData) {
      if (classError) {
        console.error('Chat class fetch error:', {
          requestId,
          classId: class_id,
          userId: user.id,
          error: classError,
        });
      }
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const { data: historyRaw, error: historyError } = await supabase
      .from('messages')
      .select('role, content')
      .eq('class_id', class_id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (historyError) {
      console.error('History fetch error:', {
        requestId,
        classId: class_id,
        userId: user.id,
        error: historyError,
      });
      return NextResponse.json({ error: 'Failed to load chat history.' }, { status: 500 });
    }

    const history: ChatMessage[] = (historyRaw || []).reverse().map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const { error: userMessageError } = await supabase
      .from('messages')
      .insert({ class_id, user_id: user.id, role: 'user', content: message });

    if (userMessageError) {
      console.error('User message insert error:', {
        requestId,
        classId: class_id,
        userId: user.id,
        error: userMessageError,
      });
      return NextResponse.json({ error: 'Failed to save user message.' }, { status: 500 });
    }

    const chunks = await searchSimilarChunks(supabase, class_id, message);
    const context = buildContext(chunks);

    let aiResponse;
    try {
      aiResponse = await chat({ context, history, message });
    } catch (error) {
      console.error('AI chat error:', {
        requestId,
        classId: class_id,
        userId: user.id,
        error,
      });
      return NextResponse.json(
        { error: 'AI service unavailable. Please check your API configuration.' },
        { status: 503 }
      );
    }

    if (aiResponse.rateLimited) {
      return NextResponse.json(
        {
          error: 'rate_limited',
          retry_after: aiResponse.retryAfter,
          provider: aiResponse.provider,
        },
        { status: 429 }
      );
    }

    const { data: assistantMsg, error: assistantError } = await supabase
      .from('messages')
      .insert({ class_id, user_id: user.id, role: 'assistant', content: aiResponse.content })
      .select('id')
      .single();

    if (assistantError) {
      console.error('Assistant message insert error:', {
        requestId,
        classId: class_id,
        userId: user.id,
        error: assistantError,
      });
      return NextResponse.json({ error: 'Failed to save assistant message.' }, { status: 500 });
    }

    return NextResponse.json({
      message_id: assistantMsg?.id,
      content: aiResponse.content,
      sources: chunks.map((c) => ({
        document_id: c.document_id,
        document_name: c.document_name,
        chunk_preview: c.content.substring(0, 100),
      })),
    });
  } catch (error) {
    console.error('Chat route error:', {
      requestId,
      classId: class_id,
      userId: user?.id,
      error,
    });
    return NextResponse.json({ error: 'Failed to process chat message.' }, { status: 500 });
  }
}
