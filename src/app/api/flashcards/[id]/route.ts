import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { front, back } = body;

  if (!front && !back) {
    return NextResponse.json({ error: 'front or back is required' }, { status: 400 });
  }

  const updateData: { front?: string; back?: string } = {};
  if (front !== undefined) updateData.front = front;
  if (back !== undefined) updateData.back = back;

  const { data, error } = await supabase
    .from('flashcards')
    .update(updateData)
    .eq('id', id)
    .select('id, front, back')
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Flashcard not found' }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase.from('flashcards').delete().eq('id', id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete flashcard' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
