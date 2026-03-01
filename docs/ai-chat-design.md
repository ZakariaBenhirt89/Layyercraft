# AI Chat → Component Pipeline — Design Document

## Architecture Diagram

[View interactive diagram on Excalidraw](https://excalidraw.com/#json=2ZVy4AOtG2FHLj__DXEmr,p49Zy6GuA4EKy-dlI2dogA)

## Architecture Overview

```
User Input (AIChatPanel)
    │
    ▼
sendAIChatRequest() ──POST──▶ server/src/routes/chat.ts
    │                              │
    │                              ├─ google/*   → Google Gemini API (direct)
    │                              ├─ ollama/*   → Ollama local (localhost:11434)
    │                              └─ *          → OpenRouter (Claude, GPT, etc.)
    │                              │
    │                              ▼
    │                        generateObject() / generateText()
    │                              │
    │◀─────── AIResponse ─────────┘
    │
    ▼
normalizeResponse()
    │
    ▼
validateAIComponents()  ──▶  Normalize IDs, props, enforce limits
    │
    ▼
Preview in chat  ──▶  "Add to Canvas" / "Update Canvas"
    │
    ▼
applyAIComponents() or applyAIModifications()  ──▶  Canvas updated
```

## Provider Routing

| Model Prefix | Provider | Endpoint | API Key | Structured Output |
|---|---|---|---|---|
| `google/*` | Google Gemini (direct) | `generativelanguage.googleapis.com/v1beta` | `GEMINI_API_KEY` | Native JSON mode |
| `anthropic/*` | OpenRouter | `openrouter.ai/api/v1` | `OPENROUTER_API_KEY` | Native tool calling |
| `openai/*` | OpenRouter | `openrouter.ai/api/v1` | `OPENROUTER_API_KEY` | Native JSON mode |
| `ollama/*` | Ollama local | `localhost:11434/v1` | None | Fallback (see below) |

## API Contract

### Request — `POST /api/chat`

```json
{
  "messages": [{ "role": "user", "content": "Create a hero section" }],
  "componentTree": [],
  "selectedComponentId": null,
  "viewMode": "desktop",
  "model": "google/gemini-3-flash-preview"
}
```

### Response — `AIResponse`

```json
{
  "intent": "create",
  "components": [
    {
      "id": "container-1-0",
      "type": "Container",
      "props": { "className": "flex flex-col items-center gap-6 p-12" },
      "children": [
        {
          "id": "heading-1-0",
          "type": "Heading",
          "props": { "className": "text-4xl font-bold", "content": "Welcome" },
          "children": []
        }
      ]
    }
  ],
  "message": "Generated a hero section with heading."
}
```

### Intent Types

| Intent | Payload | Frontend Action |
|---|---|---|
| `create` | `components: ComponentNode[]` | `onApplyCreate()` — adds nodes to canvas |
| `modify` | `modifications: AIModification[]` | `onApplyModify()` — deep-merges updates |
| `delete` | `message` explaining what to remove | User confirmation needed |
| `explain` | `message` only | Display in chat, no canvas change |

## ComponentNode Schema

```typescript
type ComponentNode = {
  id: string;
  
  type: string;                    // One of 7 allowed types
  props: Record<string, any>;      // className, content, placeholder, src, alt
  children: ComponentNode[];       // Only Container and Card may have children
  behaviors?: Behavior[];
  layoutConfig?: LayoutConfig;
  parentId?: string | null;
};
```

### Allowed Component Types

| Type | Props | Children |
|---|---|---|
| `Container` | `className` | Yes |
| `Card` | `className`, `content` | Yes |
| `Button` | `className`, `content` | No |
| `Text` | `className`, `content` | No |
| `Heading` | `className`, `content` | No |
| `Input` | `className`, `placeholder`, `type` | No |
| `Image` | `className`, `src`, `alt` | No |

### Validation Constraints

- Max 50 nodes per response
- Max 5 levels of nesting depth
- IDs auto-generated if missing or duplicated
- `props.children` normalized to `props.content`
- Unknown component types flagged as errors

## Ollama Integration — Design

### The Problem

Cloud models (Claude, GPT-4o, Gemini) support **structured output** natively — the AI SDK's `generateObject()` forces valid JSON matching the Zod schema via tool calling or JSON mode.

Ollama models have **inconsistent structured output support**. Common failure modes:

- Returns markdown-wrapped JSON (` ```json ... ``` `)
- Misses required fields (`id`, `children`)
- Invents component types outside the 7 allowed
- Produces malformed nested structures
- Wraps response in extra explanation text

### The Solution — Dual-Path Generation

```
resolveModel(modelId)
    │
    ├─ Cloud model? ──▶ generateObject() with Zod schema (strict)
    │
    └─ Ollama model? ──▶ generateText() + manual JSON extraction
                              │
                              ▼
                         extractJSON(text)
                              │  1. Strip markdown fences
                              │  2. Find first { ... } block
                              │  3. JSON.parse()
                              │  4. Validate against Zod schema
                              │  5. Return or throw
                              │
                              ▼
                         Frontend validation layer
                         (normalizes IDs, props, enforces limits)
```

### Ollama Provider Setup

Ollama exposes an **OpenAI-compatible API** at `http://localhost:11434/v1`, so we reuse `@ai-sdk/openai`:

```typescript
if (modelId.startsWith('ollama/')) {
  const ollama = createOpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',  // Required by SDK, ignored by Ollama
  });
  const ollamaModelId = modelId.replace('ollama/', '');
  return { model: ollama(ollamaModelId), useTextFallback: true };
}
```

### JSON Extraction (for text fallback)

```typescript
function extractJSON(text: string): unknown {
  // Strip markdown code fences
  let cleaned = text.replace(/```(?:json)?\s*/g, '').replace(/```/g, '').trim();

  // Find the first JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found');

  return JSON.parse(cleaned.slice(start, end + 1));
}
```

### Frontend Model Options

```typescript
const MODEL_OPTIONS = [
  { label: 'Gemini 3 Flash', value: 'google/gemini-3-flash-preview' },
  { label: 'Claude Sonnet 4.5', value: 'anthropic/claude-sonnet-4-5-20250929' },
  { label: 'GPT-4o', value: 'openai/gpt-4o' },
  { label: 'Gemini 2.0 Flash', value: 'google/gemini-2.0-flash' },
  { label: 'Llama 3 (Local)', value: 'ollama/llama3' },
  { label: 'Mistral (Local)', value: 'ollama/mistral' },
  { label: 'CodeLlama (Local)', value: 'ollama/codellama' },
];
```

### Environment Variables

```env
# server/.env
OPENROUTER_API_KEY=...          # For Claude, GPT via OpenRouter
GEMINI_API_KEY=...              # For direct Gemini access
OLLAMA_BASE_URL=http://localhost:11434   # Optional override
PORT=3001
```

## File Map

| File | Role |
|---|---|
| `src/app/components/AIChatPanel.tsx` | Chat UI, model selector, message thread, apply buttons |
| `src/utils/aiChat.ts` | `sendAIChatRequest()` — POST to server |
| `src/utils/aiValidation.ts` | Validate + normalize AI-generated ComponentNode arrays |
| `src/types/aiChat.ts` | AIResponse, AIChatMessage, AIModification types |
| `src/types/component.ts` | ComponentNode, Behavior, LayoutConfig types |
| `src/utils/componentTypes.ts` | ALLOWED_COMPONENT_TYPES constant |
| `src/app/App.tsx` | `applyAIComponents()`, `applyAIModifications()` |
| `server/src/index.ts` | Express server entry (port 3001, CORS, routes) |
| `server/src/routes/chat.ts` | POST /api/chat — provider routing, generation, response |
| `server/src/prompts/system.ts` | System prompt builder (component catalog + canvas context) |

## Safety Layers

```
LLM Output
    │
    ▼
[Server] Zod schema validation (generateObject) or JSON extraction (generateText)
    │
    ▼
[Frontend] validateAIComponents()
    │  ├─ Enforce allowed types
    │  ├─ Enforce max 50 nodes / depth 5
    │  ├─ Auto-generate missing IDs
    │  ├─ Deduplicate IDs
    │  └─ Normalize props (children → content)
    │
    ▼
[Frontend] User reviews preview → clicks "Add to Canvas"
    │
    ▼
Canvas state updated
```
