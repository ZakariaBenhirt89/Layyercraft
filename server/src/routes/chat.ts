import { Router } from 'express';
import { z } from 'zod';
import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { buildSystemPrompt } from '../prompts/system.js';

const chatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    }),
  ),
  componentTree: z.unknown().default([]),
  selectedComponentId: z.string().nullish(),
  viewMode: z.string().default('desktop'),
  model: z.string().default('anthropic/claude-sonnet-4-5-20250929'),
});

const componentNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(['Container', 'Card', 'Button', 'Text', 'Heading', 'Input', 'Image']),
    props: z.record(z.any()),
    children: z.array(componentNodeSchema).default([]),
  }),
);

const modificationSchema = z.object({
  componentId: z.string(),
  updates: z.record(z.any()),
});

const aiResponseSchema = z.object({
  intent: z.enum(['create', 'modify', 'delete', 'explain']),
  components: z.array(componentNodeSchema).optional(),
  modifications: z.array(modificationSchema).optional(),
  message: z.string().optional(),
});

function resolveModel(modelId: string) {
  // google/* models → use Google Gemini API directly
  if (modelId.startsWith('google/')) {
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }
    const google = createGoogleGenerativeAI({ apiKey: geminiKey });
    // Strip the "google/" prefix — AI SDK expects just "gemini-2.0-flash"
    const googleModelId = modelId.replace('google/', '');
    return google(googleModelId);
  }

  // Everything else → route through OpenRouter
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (!openrouterKey) {
    throw new Error('OPENROUTER_API_KEY is not configured.');
  }
  const openrouter = createOpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openrouterKey,
  });
  return openrouter(modelId);
}

export const chatRouter = Router();

chatRouter.post('/chat', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body.', details: parsed.error.flatten() });
    return;
  }

  const { messages, componentTree, selectedComponentId, viewMode, model } = parsed.data;

  let aiModel;
  try {
    aiModel = resolveModel(model);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Missing API key.';
    res.status(500).json({ error: message });
    return;
  }

  const systemPrompt = buildSystemPrompt(componentTree, selectedComponentId, viewMode);

  try {
    const result = await generateObject({
      model: aiModel,
      schema: aiResponseSchema,
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
    });

    res.json(result.object);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('AI generation failed:', message);
    res.status(502).json({ error: 'AI generation failed.', details: message });
  }
});
