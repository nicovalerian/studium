import OpenAI from 'openai';
import { generateMockEmbedding } from '@/lib/ai/providers/mock';

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!client) {
    if (!process.env.AZURE_OPENAI_API_KEY) {
      throw new Error('Missing AZURE_OPENAI_API_KEY');
    }
    if (!process.env.AZURE_OPENAI_ENDPOINT) {
      throw new Error('Missing AZURE_OPENAI_ENDPOINT');
    }
    if (!process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT) {
      throw new Error('Missing AZURE_OPENAI_EMBEDDING_DEPLOYMENT');
    }

    client = new OpenAI({
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}`,
      defaultQuery: { 'api-version': '2024-02-01' },
      defaultHeaders: { 'api-key': process.env.AZURE_OPENAI_API_KEY },
    });
  }
  return client;
}

export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.MOCK_EXTERNAL_APIS === '1') {
    return generateMockEmbedding();
  }

  const openai = getClient();

  const response = await openai.embeddings.create({
    input: text,
    model: process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT!,
  });

  return response.data[0].embedding;
}
