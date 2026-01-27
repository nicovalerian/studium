import { z } from 'zod';
import { chat } from '@/lib/ai/service';
import { buildFlashcardPrompt } from './prompts';

const FlashcardSchema = z.object({
  front: z.string().min(1).max(200),
  back: z.string().min(1).max(500),
});

const FlashcardsArraySchema = z.array(FlashcardSchema).min(5).max(15);

export type GeneratedFlashcard = z.infer<typeof FlashcardSchema>;

function extractJson(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }

  const arrayMatch = text.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    return arrayMatch[0];
  }

  return text;
}

export async function generateFlashcards(
  content: string
): Promise<{ flashcards: GeneratedFlashcard[] } | { error: string }> {
  const prompt = buildFlashcardPrompt(content, false);

  const response = await chat({
    context: '',
    history: [],
    message: prompt,
  });

  if (response.rateLimited) {
    return { error: `Rate limited. Please try again in ${response.retryAfter} seconds.` };
  }

  try {
    const jsonStr = extractJson(response.content);
    const parsed = JSON.parse(jsonStr);
    const validated = FlashcardsArraySchema.parse(parsed);
    return { flashcards: validated };
  } catch {
    const retryPrompt = buildFlashcardPrompt(content, true);
    const retryResponse = await chat({
      context: '',
      history: [],
      message: retryPrompt,
    });

    if (retryResponse.rateLimited) {
      return { error: `Rate limited. Please try again in ${retryResponse.retryAfter} seconds.` };
    }

    try {
      const jsonStr = extractJson(retryResponse.content);
      const parsed = JSON.parse(jsonStr);
      const validated = FlashcardsArraySchema.parse(parsed);
      return { flashcards: validated };
    } catch {
      return { error: 'Could not generate flashcards. Please try again.' };
    }
  }
}
