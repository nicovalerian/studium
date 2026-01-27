import { chatWithGroq } from './providers/groq';
import { chatWithGemini } from './providers/gemini';
import { generateMockChatResponse } from './providers/mock';
import { buildSystemPrompt } from './prompts';
import type { ChatRequest, ChatResponse } from './types';

const rateLimitState = {
  groq: { retryAfter: 0, timestamp: 0 },
  gemini: { retryAfter: 0, timestamp: 0 },
};

function isProviderAvailable(provider: 'groq' | 'gemini'): boolean {
  const state = rateLimitState[provider];
  if (state.timestamp === 0) return true;
  const elapsed = (Date.now() - state.timestamp) / 1000;
  return elapsed >= state.retryAfter;
}

function setRateLimit(provider: 'groq' | 'gemini', retryAfter: number): void {
  rateLimitState[provider] = { retryAfter, timestamp: Date.now() };
}

function getRemainingWait(provider: 'groq' | 'gemini'): number {
  const state = rateLimitState[provider];
  if (state.timestamp === 0) return 0;
  const elapsed = (Date.now() - state.timestamp) / 1000;
  return Math.max(0, Math.ceil(state.retryAfter - elapsed));
}

export async function chat(request: ChatRequest): Promise<ChatResponse> {
  const { context, history, message } = request;

  if (process.env.MOCK_EXTERNAL_APIS === '1') {
    return { content: await generateMockChatResponse(message), rateLimited: false };
  }

  const systemPrompt = buildSystemPrompt(context);

  const groqAvailable = isProviderAvailable('groq');
  const geminiAvailable = isProviderAvailable('gemini');

  if (groqAvailable) {
    const groqResult = await chatWithGroq(systemPrompt, history, message);
    if (!groqResult.rateLimited) {
      return { content: groqResult.content, rateLimited: false };
    }
    setRateLimit('groq', groqResult.retryAfter);
  }

  if (geminiAvailable) {
    const geminiResult = await chatWithGemini(systemPrompt, history, message);
    if (!geminiResult.rateLimited) {
      return { content: geminiResult.content, rateLimited: false };
    }
    setRateLimit('gemini', geminiResult.retryAfter);
  }

  const groqWait = getRemainingWait('groq');
  const geminiWait = getRemainingWait('gemini');
  const retryAfter = Math.min(groqWait || 60, geminiWait || 60);

  return {
    rateLimited: true,
    retryAfter,
    provider: !groqAvailable && !geminiAvailable ? 'both' : groqAvailable ? 'gemini' : 'groq',
  };
}
