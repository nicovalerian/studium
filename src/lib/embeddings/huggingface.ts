import { generateMockEmbedding } from '@/lib/ai/providers/mock';

const HF_INFERENCE_API_URL = 'https://api-inference.huggingface.co/pipeline/feature-extraction';
const DEFAULT_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

export async function generateEmbedding(text: string): Promise<number[]> {
  if (process.env.MOCK_EXTERNAL_APIS === '1') {
    return generateMockEmbedding();
  }

  const apiKey = process.env.HUGGINGFACE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing HUGGINGFACE_API_KEY');
  }

  const model = process.env.HUGGINGFACE_EMBEDDING_MODEL || DEFAULT_MODEL;
  const url = `${HF_INFERENCE_API_URL}/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: text,
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();

  if (Array.isArray(result) && typeof result[0] === 'number') {
    return result as number[];
  }

  if (Array.isArray(result) && Array.isArray(result[0])) {
    return result[0] as number[];
  }

  throw new Error(`Unexpected HuggingFace embedding response format: ${JSON.stringify(result)}`);
}
