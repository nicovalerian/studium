import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { chat } from '@/lib/ai/service';
import { searchSimilarChunks, buildContext } from '@/lib/embeddings/search';
import type { ChatMessage } from '@/lib/ai/types';

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
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

  const { data: classData, error: classError } = await supabase
    .from('classes')
    .select('id')
    .eq('id', class_id)
    .single();

  if (classError || !classData) {
    return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  }

  const { data: historyRaw } = await supabase
    .from('messages')
    .select('role, content')
    .eq('class_id', class_id)
    .order('created_at', { ascending: false })
    .limit(10);

  const history: ChatMessage[] = (historyRaw || []).reverse().map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  await supabase
    .from('messages')
    .insert({ class_id, user_id: user.id, role: 'user', content: message })
    .throwOnError();

  const chunks = await searchSimilarChunks(supabase, class_id, message);
  const context = buildContext(chunks);

  let aiResponse;
  try {
    aiResponse = await chat({ context, history, message });
  } catch (error) {
    console.error('AI chat error:', error);
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

  const { data: assistantMsg } = await supabase
    .from('messages')
    .insert({ class_id, user_id: user.id, role: 'assistant', content: aiResponse.content })
    .select('id')
    .single();

  return NextResponse.json({
    message_id: assistantMsg?.id,
    content: aiResponse.content,
    sources: chunks.map((c) => ({
      document_id: c.document_id,
      document_name: c.document_name,
      chunk_preview: c.content.substring(0, 100),
    })),
  });
}
