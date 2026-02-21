import { Router } from 'express';
import { z } from 'zod';
import { generateObject, generateText } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { buildSystemPrompt } from '../prompts/system.js';

const defaultModel = process.env.DEFAULT_MODEL ?? 'anthropic/claude-sonnet-4-5-20250929';

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
  model: z.string().default(defaultModel),
});

const layoutConfigSchema = z.object({
  flexDirection: z.enum(['row', 'column']).optional(),
  justifyContent: z.string().optional(),
  alignItems: z.string().optional(),
  gap: z.string().optional(),
  padding: z.string().optional(),
  width: z.string().optional(),
  height: z.string().optional(),
});

const behaviorSchema = z.object({
  id: z.string(),
  trigger: z.enum(['onClick', 'onHover', 'onFocus', 'onLoad']),
  action: z.enum(['navigate', 'toggle', 'submit', 'custom']),
  target: z.string().optional(),
  params: z.record(z.any()).optional(),
});

const componentNodeSchema: z.ZodType = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.enum(['Container', 'Card', 'Button', 'Text', 'Heading', 'Input', 'Image']),
    props: z.record(z.any()),
    children: z.array(componentNodeSchema).default([]),
    behaviors: z.array(behaviorSchema).optional(),
    layoutConfig: layoutConfigSchema.optional(),
    parentId: z.string().nullable().optional(),
  }),
);

const componentUpdateSchema: z.ZodType = z.lazy(() =>
  z.object({
    type: z.enum(['Container', 'Card', 'Button', 'Text', 'Heading', 'Input', 'Image']).optional(),
    props: z.record(z.any()).optional(),
    children: z.array(componentNodeSchema).optional(),
    behaviors: z.array(behaviorSchema).optional(),
    layoutConfig: layoutConfigSchema.optional(),
    parentId: z.string().nullable().optional(),
  }),
);

const modificationSchema = z.object({
  componentId: z.string(),
  updates: componentUpdateSchema,
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
    return { model: google(googleModelId), useTextFallback: false };
  }

  // ollama/* models → local OpenAI-compatible endpoint
  if (modelId.startsWith('ollama/')) {
    const baseURL = process.env.OLLAMA_BASE_URL ?? 'http://localhost:11434';
    const ollama = createOpenAI({
      baseURL: `${baseURL.replace(/\/$/, '')}/v1`,
      apiKey: 'ollama',
    });
    const ollamaModelId = modelId.replace('ollama/', '');
    return { model: ollama(ollamaModelId), useTextFallback: true };
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
  return { model: openrouter(modelId), useTextFallback: false };
}

export const chatRouter = Router();

function extractJSON(text: string) {
  const cleaned = text.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error('No JSON object found in response.');
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

chatRouter.post('/chat', async (req, res) => {
  const parsed = chatRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid request body.', details: parsed.error.flatten() });
    return;
  }

  const { messages, componentTree, selectedComponentId, viewMode, model } = parsed.data;

  let aiModel;
  let useTextFallback = false;
  try {
    const resolved = resolveModel(model);
    aiModel = resolved.model;
    useTextFallback = resolved.useTextFallback;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Missing API key.';
    res.status(500).json({ error: message });
    return;
  }

  const systemPrompt = buildSystemPrompt(componentTree, selectedComponentId, viewMode);

  try {
    if (useTextFallback) {
      const result = await generateText({
        model: aiModel,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      });
      const extracted = extractJSON(result.text);
      const validated = aiResponseSchema.parse(extracted);
      res.json(validated);
      return;
    }

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
