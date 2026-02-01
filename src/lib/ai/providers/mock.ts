const MOCK_EMBEDDING = new Array(384).fill(0.1);

export async function generateMockEmbedding(): Promise<number[]> {
  return MOCK_EMBEDDING;
}

export async function generateMockChatResponse(message: string): Promise<string> {
  return `Mock AI response for testing. Your question was about: "${message.substring(0, 50)}..."`;
}
