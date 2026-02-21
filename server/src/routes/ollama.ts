import { Router } from 'express';

export const ollamaRouter = Router();

const getOllamaBase = () =>
  (process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434').replace(/\/$/, '');

ollamaRouter.get('/health', async (_req, res) => {
  try {
    const response = await fetch(`${getOllamaBase()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (response.ok) {
      res.json({ status: 'ok' });
    } else {
      res.status(502).json({ status: 'error', details: `Ollama returned ${response.status}` });
    }
  } catch {
    res.status(503).json({ status: 'unavailable', details: 'Cannot reach Ollama.' });
  }
});

ollamaRouter.get('/models', async (_req, res) => {
  try {
    const response = await fetch(`${getOllamaBase()}/api/tags`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!response.ok) {
      res.status(502).json({ error: `Ollama returned ${response.status}` });
      return;
    }
    const data = (await response.json()) as { models?: Array<{ name: string }> };
    const models = (data.models ?? []).map((m) => ({
      label: m.name,
      value: `ollama/${m.name}`,
    }));
    res.json({ models });
  } catch {
    res.status(503).json({ error: 'Cannot reach Ollama.' });
  }
});
