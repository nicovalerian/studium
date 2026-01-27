import Groq from 'groq-sdk';
import type { ChatMessage } from '../types';

let client: Groq | null = null;

function getClient(): Groq {
  if (!client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('Missing GROQ_API_KEY');
    }
    client = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return client;
}

export interface GroqResult {
  content: string;
  rateLimited: false;
}

export interface GroqRateLimited {
  rateLimited: true;
  retryAfter: number;
}

export type GroqResponse = GroqResult | GroqRateLimited;

export async function chatWithGroq(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<GroqResponse> {
  const groq = getClient();

  const messages: Groq.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    return {
      content: completion.choices[0]?.message?.content || '',
      rateLimited: false,
    };
  } catch (error) {
    if (isRateLimitError(error)) {
      return {
        rateLimited: true,
        retryAfter: extractRetryAfter(error),
      };
    }
    throw error;
  }
}

function isRateLimitError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    const e = error as { status?: number; error?: { code?: string }; message?: string };
    if (e.status === 429) return true;
    if (e.error?.code === 'rate_limit_exceeded') return true;
    if (typeof e.message === 'string' && e.message.toLowerCase().includes('rate limit')) return true;
  }
  return false;
}

function extractRetryAfter(error: unknown): number {
  if (error && typeof error === 'object') {
    const e = error as { headers?: { get?: (name: string) => string | null } };
    const retryAfterHeader = e.headers?.get?.('retry-after');
    if (retryAfterHeader) {
      const seconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(seconds)) return seconds;
    }
  }
  return 60;
}
