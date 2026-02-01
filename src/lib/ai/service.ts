import { chatWithAzureFoundry } from './providers/azure-foundry';
import { generateMockChatResponse } from './providers/mock';
import { buildSystemPrompt } from './prompts';
import type { ChatRequest, ChatResponse } from './types';

const rateLimitState = {
  azure: { retryAfter: 0, timestamp: 0 },
};

function isProviderAvailable(): boolean {
  const state = rateLimitState.azure;
  if (state.timestamp === 0) return true;
  const elapsed = (Date.now() - state.timestamp) / 1000;
  return elapsed >= state.retryAfter;
}

function setRateLimit(retryAfter: number): void {
  rateLimitState.azure = { retryAfter, timestamp: Date.now() };
}

function getRemainingWait(): number {
  const state = rateLimitState.azure;
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

  if (!isProviderAvailable()) {
    return {
      rateLimited: true,
      retryAfter: getRemainingWait(),
      provider: 'azure',
    };
  }

  const result = await chatWithAzureFoundry(systemPrompt, history, message);

  if (!result.rateLimited) {
    return { content: result.content, rateLimited: false };
  }

  setRateLimit(result.retryAfter);
  return {
    rateLimited: true,
    retryAfter: result.retryAfter,
    provider: 'azure',
  };
}
