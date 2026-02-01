import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ChatMessage } from '../types';

const DO_GRADIENT_BASE_URL = 'https://inference.do-ai.run/v1';
const DEFAULT_MODEL = 'llama3.3-70b-instruct';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.DO_GRADIENT_API_KEY) {
      throw new Error('Missing DO_GRADIENT_API_KEY');
    }

    client = new OpenAI({
      apiKey: process.env.DO_GRADIENT_API_KEY,
      baseURL: DO_GRADIENT_BASE_URL,
    });
  }
  return client;
}

function getModel(): string {
  return process.env.DO_GRADIENT_CHAT_MODEL || DEFAULT_MODEL;
}

export interface DOGradientResult {
  content: string;
  rateLimited: false;
}

export interface DOGradientRateLimited {
  rateLimited: true;
  retryAfter: number;
}

export type DOGradientResponse = DOGradientResult | DOGradientRateLimited;

export async function chatWithDOGradient(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<DOGradientResponse> {
  const openai = getClient();

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: getModel(),
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
    const e = error as { status?: number; code?: string; message?: string };
    if (e.status === 429) return true;
    if (e.code === 'RateLimitError') return true;
    if (typeof e.message === 'string' && e.message.toLowerCase().includes('rate limit'))
      return true;
  }
  return false;
}

const DEFAULT_RETRY_SECONDS = 60;

function extractRetryAfter(error: unknown): number {
  if (error && typeof error === 'object') {
    const e = error as { headers?: Record<string, string> };
    const retryAfterHeader = e.headers?.['retry-after'];
    if (retryAfterHeader) {
      const seconds = parseInt(retryAfterHeader, 10);
      if (!isNaN(seconds)) return seconds;
    }
  }
  return DEFAULT_RETRY_SECONDS;
}
