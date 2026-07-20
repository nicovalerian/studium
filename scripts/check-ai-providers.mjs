import { config } from 'dotenv';

config({ path: '.env.local', quiet: true });

const DO_BASE_URL = 'https://inference.do-ai.run/v1';
const HF_BASE_URL = 'https://router.huggingface.co/hf-inference/models';
const DEFAULT_CHAT_MODEL = 'llama-4-maverick';
const DEFAULT_EMBEDDING_MODEL = 'sentence-transformers/all-MiniLM-L6-v2';

function summarizeError(payload, fallback) {
  const candidate = payload?.error?.message ?? payload?.message ?? payload?.error ?? fallback;
  return String(candidate).replace(/\s+/g, ' ').slice(0, 240);
}

async function readPayload(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function printResult(provider, result) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'} ${provider}: ${result.summary}`);
}

async function checkDigitalOcean() {
  const apiKey = process.env.DO_GRADIENT_API_KEY;
  const model = process.env.DO_GRADIENT_CHAT_MODEL || DEFAULT_CHAT_MODEL;

  if (!apiKey) return { ok: false, summary: 'DO_GRADIENT_API_KEY is missing.' };

  const headers = { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' };
  const modelsResponse = await fetch(`${DO_BASE_URL}/models`, { headers });
  const modelsPayload = await readPayload(modelsResponse);

  if (!modelsResponse.ok) {
    return {
      ok: false,
      summary: `model catalog returned HTTP ${modelsResponse.status}: ${summarizeError(modelsPayload, modelsResponse.statusText)}`,
    };
  }

  const modelIds = Array.isArray(modelsPayload?.data)
    ? modelsPayload.data.map((entry) => entry?.id).filter(Boolean)
    : [];

  if (!modelIds.includes(model)) {
    return {
      ok: false,
      summary: `key authenticated, but configured model ${model} is not in the ${modelIds.length}-model catalog.`,
    };
  }

  const chatResponse = await fetch(`${DO_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: 'Reply with only: OK' }],
      max_tokens: 4,
      temperature: 0,
    }),
  });
  const chatPayload = await readPayload(chatResponse);

  if (!chatResponse.ok) {
    return {
      ok: false,
      summary: `key and model are valid, but inference returned HTTP ${chatResponse.status}: ${summarizeError(chatPayload, chatResponse.statusText)}`,
    };
  }

  const content = chatPayload?.choices?.[0]?.message?.content;
  return {
    ok: typeof content === 'string' && content.length > 0,
    summary: `${model} authenticated, listed, and completed a minimal inference request.`,
  };
}

async function checkHuggingFace() {
  const apiKey = process.env.HUGGINGFACE_API_KEY;
  const model = process.env.HUGGINGFACE_EMBEDDING_MODEL || DEFAULT_EMBEDDING_MODEL;

  if (!apiKey) return { ok: false, summary: 'HUGGINGFACE_API_KEY is missing.' };

  const identityResponse = await fetch('https://huggingface.co/api/whoami-v2', {
    headers: { Authorization: `Bearer ${apiKey}` },
  });

  if (!identityResponse.ok) {
    return {
      ok: false,
      summary: `token identity check returned HTTP ${identityResponse.status}; replace HUGGINGFACE_API_KEY.`,
    };
  }

  const response = await fetch(`${HF_BASE_URL}/${model}/pipeline/feature-extraction`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ inputs: 'Studium provider health check.' }),
  });
  const payload = await readPayload(response);

  if (!response.ok) {
    return {
      ok: false,
      summary: `${model} returned HTTP ${response.status}: ${summarizeError(payload, response.statusText)}`,
    };
  }

  const vector = Array.isArray(payload?.[0]) ? payload[0] : payload;
  const dimensions = Array.isArray(vector) ? vector.length : 0;

  return {
    ok: dimensions === 384,
    summary:
      dimensions === 384
        ? `${model} authenticated and returned the expected 384-dimensional embedding.`
        : `${model} returned ${dimensions || 'an unknown number of'} dimensions; the database expects 384.`,
  };
}

async function run() {
  console.log('Studium AI provider check (secret values are never printed)');

  const checks = await Promise.allSettled([checkDigitalOcean(), checkHuggingFace()]);
  const providers = ['DigitalOcean', 'Hugging Face'];
  let failed = false;

  checks.forEach((check, index) => {
    const result =
      check.status === 'fulfilled'
        ? check.value
        : {
            ok: false,
            summary: check.reason instanceof Error ? check.reason.message : String(check.reason),
          };
    printResult(providers[index], result);
    failed ||= !result.ok;
  });

  process.exitCode = failed ? 1 : 0;
}

await run();
