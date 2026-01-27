export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  context: string;
  history: ChatMessage[];
  message: string;
}

export interface ChatSuccess {
  content: string;
  rateLimited: false;
}

export interface ChatRateLimited {
  rateLimited: true;
  retryAfter: number;
  provider: 'groq' | 'gemini' | 'both';
}

export type ChatResponse = ChatSuccess | ChatRateLimited;

export interface DocumentChunk {
  id: string;
  document_id: string;
  document_name: string;
  content: string;
  similarity: number;
}

export interface ChatSource {
  document_id: string;
  document_name: string;
  chunk_preview: string;
}
