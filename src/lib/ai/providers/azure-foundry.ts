import { AzureOpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import type { ChatMessage } from '../types';

let client: AzureOpenAI | null = null;

function getClient(): AzureOpenAI {
  if (!client) {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('Missing AZURE_OPENAI_API_KEY');
    }
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error('Missing AZURE_OPENAI_ENDPOINT');
    }
    if (!process.env.AZURE_OPENAI_CHAT_DEPLOYMENT) {
      throw new Error('Missing AZURE_OPENAI_CHAT_DEPLOYMENT');
    }

    client = new AzureOpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT,
      deployment: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT,
      apiVersion: '2024-10-01-preview',
    });
  }
  return client;
}

export interface AzureFoundryResult {
  content: string;
  rateLimited: false;
}

export interface AzureFoundryRateLimited {
  rateLimited: true;
  retryAfter: number;
}

export type AzureFoundryResponse = AzureFoundryResult | AzureFoundryRateLimited;

export async function chatWithAzureFoundry(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<AzureFoundryResponse> {
  const azure = getClient();

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...history.map((m) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
    { role: 'user', content: userMessage },
  ];

  try {
    const completion = await azure.chat.completions.create({
      model: process.env.AZURE_OPENAI_CHAT_DEPLOYMENT!,
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
