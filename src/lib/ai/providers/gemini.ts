import { GoogleGenAI } from '@google/genai';
import type { ChatMessage } from '../types';

let client: GoogleGenAI | null = null;

function getClient(): GoogleGenAI {
  if (!client) {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('Missing GOOGLE_GENERATIVE_AI_API_KEY');
    }
    client = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
  }
  return client;
}

export interface GeminiResult {
  content: string;
  rateLimited: false;
}

export interface GeminiRateLimited {
  rateLimited: true;
  retryAfter: number;
}

export type GeminiResponse = GeminiResult | GeminiRateLimited;

export async function chatWithGemini(
  systemPrompt: string,
  history: ChatMessage[],
  userMessage: string
): Promise<GeminiResponse> {
  const genai = getClient();

  const contents = [
    ...history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ];

  try {
    const response = await genai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents,
      config: {
        systemInstruction: systemPrompt,
        maxOutputTokens: 2048,
        temperature: 0.7,
      },
    });

    return {
      content: response.text || '',
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
    const e = error as { status?: number | string; message?: string };
    if (e.status === 429 || e.status === 'RESOURCE_EXHAUSTED') return true;
    if (typeof e.message === 'string') {
      const msg = e.message.toLowerCase();
      if (msg.includes('quota') || msg.includes('rate')) return true;
    }
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
