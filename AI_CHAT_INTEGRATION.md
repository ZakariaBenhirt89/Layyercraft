# AI Chat Integration — Component Generation via Natural Language

## Document Purpose

This document defines the architecture and implementation path for integrating an AI-powered chat assistant into Layercraft. The assistant takes natural language descriptions and generates `ComponentNode` trees that get placed directly onto the UI Builder canvas.

**Status:** Design Phase
**Version:** 1.0
**Date:** 2026-02-15

---

## 1. Core Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | **Next.js** | Built-in API routes, native AI SDK support, SSR for future needs |
| AI SDK | **Vercel AI SDK v6** | Industry standard, `useChat` hook, streaming, multi-provider |
| Providers | **Anthropic + OpenAI** | Flexible — use Claude for reasoning, GPT for speed, swap anytime |
| AI Role | **Component generation** | User describes UI → AI produces `ComponentNode[]` → injected into canvas |

---

## 2. Migration: Vite → Next.js

The UI Builder currently runs on Vite + React. Moving to Next.js affects the monorepo structure.

### 2.1 What Changes

```
BEFORE (Vite):                       AFTER (Next.js):
├── index.html                       ├── app/
├── vite.config.ts                   │   ├── layout.tsx
├── src/                             │   ├── page.tsx
│   ├── main.tsx                     │   └── api/
│   ├── app/                         │       └── chat/
│   │   ├── App.tsx                  │           └── route.ts
│   │   └── components/              ├── components/        (moved from src/app/components)
│   ├── types/                       ├── types/
│   ├── utils/                       ├── utils/
│   └── styles/                      ├── styles/
├── package.json                     ├── next.config.ts
└── vite.config.ts                   ├── tailwind.config.ts (if needed)
                                     └── package.json
```

### 2.2 Migration Steps

1. **Install Next.js** alongside existing deps
2. **Create `app/` directory** with Next.js App Router structure
3. **Move components** from `src/app/components/` → `components/`
4. **Adapt `App.tsx`** → becomes `app/page.tsx` (client component with `'use client'`)
5. **Move styles** — Tailwind CSS 4 works with Next.js via `@tailwindcss/postcss`
6. **Update imports** — `@/` alias stays the same, just reconfigure in `tsconfig.json`
7. **Remove Vite** — delete `vite.config.ts`, `index.html`, update scripts
8. **Add API route** — `app/api/chat/route.ts` for AI SDK
9. **Verify** — everything renders identically before adding AI features

### 2.3 What Stays the Same

- React 18 components — zero changes to component code
- Tailwind CSS 4 — works with Next.js
- Radix UI / shadcn/ui — framework-agnostic, no changes
- react-dnd — works in client components
- All types and utilities — unchanged
- Zustand stores — unchanged

### 2.4 Key Gotcha: Client Components

Next.js App Router defaults to Server Components. The UI Builder is entirely interactive (drag-and-drop, state, etc.), so the main page must be a Client Component:

```tsx
// app/page.tsx
'use client';

import { App } from '@/components/App';  // The existing App.tsx, renamed

export default function Page() {
  return <App />;
}
```

Only the API route (`app/api/chat/route.ts`) runs server-side. Everything else stays client-side — same as before.

### 2.5 Updated Monorepo Structure

```
/Tui (root)
├── package.json                      # Root workspace config
├── pnpm-workspace.yaml
├── tsconfig.base.json
│
├── packages/
│   ├── shared-types/                 # Shared TypeScript types
│   ├── shared-utils/                 # Shared utilities
│   └── shared-ui/                    # Shared UI components (future)
│
├── apps/
│   ├── builder/                      # App 1 — UI Builder (NOW Next.js)
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tsconfig.json
│   │   ├── app/
│   │   │   ├── layout.tsx            # Root layout (html, body, providers)
│   │   │   ├── page.tsx              # Main builder page ('use client')
│   │   │   └── api/
│   │   │       └── chat/
│   │   │           └── route.ts      # AI chat endpoint
│   │   ├── components/               # All builder components
│   │   │   ├── App.tsx
│   │   │   ├── Canvas.tsx
│   │   │   ├── ComponentLibrary.tsx
│   │   │   ├── ComponentRenderer.tsx
│   │   │   ├── DropZone.tsx
│   │   │   ├── PropertiesPanel.tsx
│   │   │   ├── Toolbar.tsx
│   │   │   ├── AIChatPanel.tsx       # NEW — AI chat interface
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── types/
│   │   ├── stores/
│   │   ├── utils/
│   │   └── styles/
│   │
│   └── logic/                        # App 2 — Business Logic Builder
│       ├── ...                       # (also Next.js or stays Vite — independent choice)
│
└── logo/
```

---

## 3. AI SDK Setup

### 3.1 Required Packages

```
# Core AI SDK
ai                         # AI SDK core (v6)
@ai-sdk/react              # React hooks (useChat, useCompletion)

# Provider (OpenRouter — access 200+ models with a single API key)
@ai-sdk/openai             # OpenRouter uses an OpenAI-compatible API
```

No need for separate `@ai-sdk/anthropic` or `@ai-sdk/openai` provider packages for each vendor. OpenRouter proxies all providers (Anthropic, OpenAI, Google, Meta, Mistral, etc.) through a single OpenAI-compatible endpoint.

### 3.2 Environment Variables

```env
# .env.local (never committed)
OPENROUTER_API_KEY=sk-or-...
AI_MODEL=anthropic/claude-sonnet-4-5-20250929  # Default model (OpenRouter format)
```

### 3.3 OpenRouter Provider Setup

```typescript
import { createOpenAI } from '@ai-sdk/openai';

const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Use ANY model available on OpenRouter:
// openrouter('anthropic/claude-sonnet-4-5-20250929')
// openrouter('openai/gpt-4o')
// openrouter('google/gemini-2.0-flash')
// openrouter('meta-llama/llama-3.1-405b-instruct')
// openrouter('mistralai/mistral-large')

const model = openrouter(process.env.AI_MODEL ?? 'anthropic/claude-sonnet-4-5-20250929');
```

Users can switch models from the UI by changing a single string — no code changes, no extra API keys.

### 3.4 API Route

```
app/api/chat/route.ts
```

This is the server-side endpoint that:
1. Receives the user message + current component tree context
2. Calls the LLM with a system prompt specialized for component generation
3. Streams the response back to the client
4. Parses structured output (ComponentNode[]) from the LLM response

### 3.5 Provider Flexibility via OpenRouter

Model switching is just a string change — all routed through OpenRouter:

```typescript
// User selects model from dropdown in the UI
const model = openrouter(selectedModel);
// selectedModel = "anthropic/claude-sonnet-4-5-20250929"
// selectedModel = "openai/gpt-4o"
// selectedModel = "google/gemini-2.0-flash"
```

One API key, one provider config, 200+ models. OpenRouter also handles rate limiting, fallbacks, and cost tracking across all providers.

---

## 4. Component Generation — How It Works

### 4.1 User Flow

```
┌──────────────────────────────────────────────────────────────────┐
│  UI Builder                                                       │
│  ┌──────────┬──────────────────┬──────────────────────────────┐  │
│  │Component │                  │  AI Chat Panel (NEW)         │  │
│  │Library   │     Canvas       │  ┌────────────────────────┐  │  │
│  │          │                  │  │ 💬 "Create a pricing    │  │  │
│  │          │                  │  │ section with 3 cards,   │  │  │
│  │          │                  │  │ each with a title,      │  │  │
│  │          │                  │  │ price, feature list,    │  │  │
│  │          │                  │  │ and CTA button"         │  │  │
│  │          │                  │  ├────────────────────────┤  │  │
│  │          │                  │  │ 🤖 Generating...        │  │  │
│  │          │                  │  │                         │  │  │
│  │          │                  │  │ ┌─ Preview ──────────┐  │  │  │
│  │          │                  │  │ │ Container (flex)    │  │  │  │
│  │          │                  │  │ │  ├─ Card "Free"     │  │  │  │
│  │          │                  │  │ │  ├─ Card "Pro"      │  │  │  │
│  │          │                  │  │ │  └─ Card "Enterprise│  │  │  │
│  │          │                  │  │ └────────────────────┘  │  │  │
│  │          │                  │  │                         │  │  │
│  │          │                  │  │ [Add to Canvas] [Edit]  │  │  │
│  │          │                  │  └────────────────────────┘  │  │
│  └──────────┴──────────────────┴──────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

**Step-by-step:**

1. User opens the AI Chat Panel (toggle button in Toolbar or keyboard shortcut)
2. User types a natural language description of what they want
3. AI generates a `ComponentNode[]` tree matching the description
4. The response streams in — user sees a **tree preview** of what will be created
5. User clicks **"Add to Canvas"** to inject the nodes into the component tree
6. Components appear on canvas, fully editable like any manually-created component
7. User can refine: "Make the Pro card highlighted" → AI modifies the existing nodes

### 4.2 System Prompt Design

The system prompt is the most critical piece. It must teach the LLM to output valid `ComponentNode` structures.

```
SYSTEM PROMPT (conceptual — will need iteration):

You are a UI component generator for the Layercraft UI builder.

When the user describes a UI, you generate a JSON array of ComponentNode objects.

Available component types and their props:

1. Container
   - props: { className: string }
   - layoutConfig: { flexDirection, justifyContent, alignItems, gap, padding }
   - Can have children

2. Card
   - props: { className: string }
   - layoutConfig: { padding }
   - Can have children

3. Button
   - props: { className: string, children: string, variant: "primary"|"secondary"|"outline" }
   - Leaf component

4. Text
   - props: { className: string, children: string }
   - Leaf component

5. Heading
   - props: { className: string, children: string, variant: "large"|"medium" }
   - Leaf component

6. Input
   - props: { className: string, placeholder: string, type: "text"|"email"|"password" }
   - Leaf component

7. Image
   - props: { className: string, src: string, alt: string }
   - Leaf component

Rules:
- Always output valid JSON wrapped in ```json code blocks
- Every node must have: id (unique string), type, props, children (array, empty for leaf)
- Use Tailwind CSS classes in className props
- Use sensible defaults for content (realistic placeholder text)
- Nest components logically (cards inside containers, text inside cards, etc.)
- Match the user's description as closely as possible
- If modifying existing components, reference them by ID

Example output for "a hero section with a title and button":
```json
[{
  "id": "hero-1",
  "type": "Container",
  "props": { "className": "flex flex-col items-center justify-center py-20 px-8 bg-slate-50" },
  "layoutConfig": { "flexDirection": "column", "alignItems": "center", "padding": "80px 32px" },
  "children": [
    {
      "id": "hero-title-1",
      "type": "Heading",
      "props": { "className": "text-4xl font-bold text-slate-900 mb-4", "children": "Build Faster", "variant": "large" },
      "children": []
    },
    {
      "id": "hero-cta-1",
      "type": "Button",
      "props": { "className": "px-8 py-3 text-lg", "children": "Get Started", "variant": "primary" },
      "children": []
    }
  ]
}]
```
```

### 4.3 Structured Output vs. Text Parsing

Two approaches for getting `ComponentNode[]` from the LLM:

**Option A: Structured Output (Recommended)**

AI SDK v6 supports `generateObject()` with Zod schemas for type-safe structured output:

```typescript
import { z } from 'zod';

const ComponentNodeSchema = z.object({
  id: z.string(),
  type: z.enum(['Container', 'Card', 'Button', 'Text', 'Heading', 'Input', 'Image']),
  props: z.record(z.any()),
  children: z.lazy(() => z.array(ComponentNodeSchema)),
  layoutConfig: z.object({...}).optional(),
});

const result = await generateObject({
  model: anthropic('claude-sonnet-4-5-20250929'),
  schema: z.array(ComponentNodeSchema),
  prompt: userMessage,
  system: systemPrompt,
});

// result.object is typed as ComponentNode[] — guaranteed valid
```

Pros: Guaranteed valid JSON, type-safe, no parsing errors
Cons: No streaming (must wait for full response), slightly slower

**Option B: Streaming Text + Parse**

Use `streamText()` and parse the JSON from the streamed response:

```typescript
const result = streamText({
  model: anthropic('claude-sonnet-4-5-20250929'),
  system: systemPrompt,
  messages: conversationHistory,
});

// Stream text to client, then parse JSON blocks from the final message
```

Pros: Streaming UX (user sees text flowing), can include explanatory text alongside JSON
Cons: Must parse JSON from text, possible formatting errors

**Recommendation:** Use **Option A (structured output) for component generation** and **Option B (streaming text) for conversational responses**. Detect intent from the user message — if they're asking to create/modify UI, use structured output. If they're asking a question, use streaming text.

### 4.4 Context Awareness

The AI should know what's already on the canvas so it can:
- Avoid duplicate IDs
- Reference existing components ("make the header blue")
- Understand the current layout ("add a sidebar next to the main content")

**Send with each request:**
```typescript
{
  messages: UIMessage[],          // Chat history
  componentTree: ComponentNode[], // Current canvas state
  selectedComponentId?: string,   // What the user has selected
  viewMode: string,               // desktop/tablet/mobile
}
```

The system prompt should include the current tree as context:

```
Current canvas state:
```json
[... serialized component tree ...]
```

The user may reference existing components by name or description.
When they say "modify" or "change", update the existing nodes.
When they say "add" or "create", generate new nodes.
```

### 4.5 Modification Flow

For modifying existing components:

1. User selects a component on canvas
2. User types: "Make this card have a gradient background and rounded corners"
3. AI receives the selected component's data
4. AI returns a modified version of that component (same ID, updated props)
5. The `updateComponent()` utility replaces the old node with the new one

For this to work, the API response needs to indicate the **intent**:

```typescript
type AIResponse = {
  intent: 'create' | 'modify' | 'delete' | 'explain';
  components?: ComponentNode[];     // For create: new nodes to add
  modifications?: {                 // For modify: partial updates
    componentId: string;
    updates: Partial<ComponentNode>;
  }[];
  message?: string;                 // For explain: text response
};
```

---

## 5. AIChatPanel Component Design

### 5.1 Location

The AI Chat Panel replaces or sits alongside the Properties Panel on the right side. Toggle between:
- Properties Panel (component editing)
- AI Chat Panel (AI generation)

Or: slide-out panel from the right edge, overlaying the properties panel.

### 5.2 Panel Structure

```
┌────────────────────────────────────┐
│  AI Assistant               [×]   │
├────────────────────────────────────┤
│                                    │
│  💬 User: Create a contact form   │
│      with name, email, message    │
│      fields and a submit button   │
│                                    │
│  🤖 AI: Here's your contact form: │
│                                    │
│  ┌─ Generated Components ───────┐ │
│  │  📦 Container "Contact Form" │ │
│  │    ├─ 📰 Heading "Contact"   │ │
│  │    ├─ 📝 Input (name)        │ │
│  │    ├─ 📝 Input (email)       │ │
│  │    ├─ 📝 Input (message)     │ │
│  │    └─ 🎨 Button "Send"      │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Add to Canvas]  [Regenerate]    │
│                                    │
│  💬 User: Make it horizontal,     │
│      two columns                  │
│                                    │
│  🤖 AI: Updated layout:          │
│                                    │
│  ┌─ Modified Components ────────┐ │
│  │  📦 Container (flex-row)     │ │
│  │    ├─ 📦 Left Column         │ │
│  │    │   ├─ 📝 Input (name)    │ │
│  │    │   └─ 📝 Input (email)   │ │
│  │    └─ 📦 Right Column        │ │
│  │        ├─ 📝 Input (message) │ │
│  │        └─ 🎨 Button "Send"  │ │
│  └──────────────────────────────┘ │
│                                    │
│  [Update Canvas]  [Regenerate]    │
│                                    │
├────────────────────────────────────┤
│  [Type a message...        ] [↑]  │
│                                    │
│  Context: 🎯 Card "Hero" selected │
│  Provider: [Claude ▼] [⚙]        │
└────────────────────────────────────┘
```

### 5.3 Key UI Elements

1. **Message Thread** — scrollable chat history with user/AI messages
2. **Component Preview** — tree view of generated/modified components (inside AI messages)
3. **Action Buttons** — "Add to Canvas" (create), "Update Canvas" (modify), "Regenerate" (retry)
4. **Input Bar** — text input with send button
5. **Context Indicator** — shows selected component (if any) for modification context
6. **Provider Selector** — switch between Claude/GPT on the fly
7. **Settings Gear** — model selection, temperature, max tokens

### 5.4 States

| State | UI |
|-------|-----|
| Idle | Input focused, ready to type |
| Generating | Spinner or streaming text, input disabled |
| Preview | Generated tree shown with action buttons |
| Error | Error message with retry button |
| Applied | Success toast, components visible on canvas |

---

## 6. Prompt Engineering Strategy

### 6.1 System Prompt Layers

The system prompt is built from multiple layers:

```
Layer 1: Role & capabilities
  "You are a UI component generator for Layercraft..."

Layer 2: Component catalog
  Full list of available types, props, and constraints

Layer 3: Style guidelines
  "Use Tailwind CSS classes. Prefer: ..."
  "Follow spacing scale: 4, 8, 12, 16, 24, 32, 48, 64"
  "Use semantic colors: slate for text, blue for primary..."

Layer 4: Current canvas state (dynamic)
  Serialized component tree from the builder

Layer 5: Selected component (dynamic, if any)
  The component the user has selected for modification

Layer 6: Output format rules
  JSON schema, ID generation rules, nesting rules
```

### 6.2 Prompt Templates by Intent

**Create intent:**
```
Generate new ComponentNode[] for the following request.
Do not modify existing components. Generate new IDs using the format: "{type}-{uuid}".
```

**Modify intent:**
```
The user wants to modify existing components. Return only the modified components
with their original IDs. Only include changed fields.
Currently selected: {selectedComponent}
```

**Layout intent:**
```
The user wants to reorganize the layout. Return the full updated tree with
components rearranged but keeping their original IDs and content.
```

### 6.3 Few-Shot Examples

Include 3-5 examples in the system prompt covering:
1. Simple single component ("a blue button that says Subscribe")
2. Nested layout ("a card with a title, description, and action buttons")
3. Complex section ("a pricing table with 3 tiers")
4. Modification ("make the heading larger and centered")
5. Layout change ("convert this to a 2-column grid")

### 6.4 Guardrails

- **Max depth:** Limit nesting to 5 levels (prevent unbounded recursion)
- **Max nodes:** Cap at 50 components per generation (prevent token waste)
- **Valid types only:** Reject unknown component types
- **ID uniqueness:** Validate no duplicate IDs in output
- **Schema validation:** Run Zod validation on every AI response before offering "Add to Canvas"

---

## 7. Integration with Canvas

### 7.1 Adding Generated Components

When user clicks "Add to Canvas":

```
1. Validate the generated ComponentNode[] with Zod
2. Generate unique IDs if not already unique (prefix with timestamp)
3. Determine insertion point:
   a. If a container is selected → add as children of that container
   b. If a leaf component is selected → add as siblings after it
   c. If nothing selected → add to root level
4. Call addComponent() for each top-level node
5. Auto-select the first generated component
6. Show success toast: "Added 5 components to canvas"
```

### 7.2 Updating Existing Components

When user clicks "Update Canvas":

```
1. Validate modifications
2. For each modification:
   a. Find the component by ID in the tree
   b. Merge the updates (deep merge for props, replace for children)
   c. Call updateComponent()
3. Keep selection on the modified component
4. Show success toast: "Updated 2 components"
```

### 7.3 Undo Support

Critical: every AI-generated change must be undoable.

- Before applying AI changes, snapshot the current tree to the history store
- User can Ctrl+Z to revert the entire AI generation in one step
- This requires the history/undo system (from Phase 3 of the main implementation plan)

---

## 8. Implementation Phases

### Phase AI-1: Next.js Migration

**Goal:** Move the UI Builder from Vite to Next.js without changing functionality.

**Tasks:**
- [ ] Install Next.js, remove Vite
- [ ] Create `app/layout.tsx` and `app/page.tsx`
- [ ] Move components, types, utils, styles
- [ ] Update Tailwind CSS config for Next.js
- [ ] Update `@/` alias in tsconfig
- [ ] Add `'use client'` to interactive components
- [ ] Verify drag-and-drop, all existing features work identically
- [ ] Update monorepo scripts

**Risk:** react-dnd may need configuration with Next.js App Router. The `DndProvider` must wrap a client component tree. This should work since the entire builder page is `'use client'`.

**Estimated complexity:** Medium. Mostly mechanical file moves, but edge cases with SSR/client boundaries.

---

### Phase AI-2: AI SDK Setup & API Route

**Goal:** Install AI SDK, create chat API route, verify basic streaming.

**Tasks:**
- [ ] Install `ai`, `@ai-sdk/react`, `@ai-sdk/anthropic`, `@ai-sdk/openai`
- [ ] Create `.env.local` with API keys
- [ ] Create `app/api/chat/route.ts` with basic streaming
- [ ] Create a test page or component with `useChat` to verify streaming works
- [ ] Test with both Anthropic and OpenAI providers

**Estimated complexity:** Low. Standard AI SDK setup.

---

### Phase AI-3: AIChatPanel UI

**Goal:** Build the chat panel UI (without component generation yet).

**Tasks:**
- [ ] Create `AIChatPanel.tsx` — message thread + input
- [ ] Add toggle in Toolbar to show/hide AI panel
- [ ] Integrate `useChat` hook for basic conversation
- [ ] Style with Tailwind + shadcn/ui components
- [ ] Add provider selector dropdown
- [ ] Add context indicator (selected component)

**Estimated complexity:** Medium. Standard UI work.

---

### Phase AI-4: Component Generation (Core Feature)

**Goal:** AI generates valid ComponentNode[] from descriptions.

**Tasks:**
- [ ] Design and iterate on the system prompt
- [ ] Implement structured output with Zod schema for ComponentNode
- [ ] Build intent detection (create vs. modify vs. explain)
- [ ] Build component preview tree inside chat messages
- [ ] Implement "Add to Canvas" flow
- [ ] Implement "Update Canvas" flow (for modifications)
- [ ] Add schema validation on AI responses
- [ ] Add error handling for malformed responses
- [ ] Send current canvas state as context

**Estimated complexity:** High. The system prompt needs significant iteration. This is where most of the value and most of the bugs will be.

---

### Phase AI-5: Refinement & Polish

**Goal:** Make the AI assistant reliable and pleasant to use.

**Tasks:**
- [ ] Add few-shot examples to system prompt
- [ ] Implement guardrails (max depth, max nodes, valid types)
- [ ] Add "Regenerate" button
- [ ] Add keyboard shortcut to open AI panel (Cmd+K or Cmd+J)
- [ ] Integrate with undo/redo history
- [ ] Add loading states and streaming indicators
- [ ] Handle edge cases (empty response, timeout, rate limiting)
- [ ] Add "Use as template" — save AI-generated patterns for reuse
- [ ] Test with diverse prompts and fix common failures

**Estimated complexity:** Medium-high. Lots of edge cases.

---

## 9. Implementation Order

```
Priority 1: Foundation
  AI-1  Next.js migration                    ← Start here
  AI-2  AI SDK setup & API route

Priority 2: Core
  AI-3  AIChatPanel UI
  AI-4  Component generation (the hard part)

Priority 3: Polish
  AI-5  Refinement & guardrails
```

**Total new files:** ~8-10 files
**Total modified files:** ~5-8 files (mostly moves from Vite → Next.js)

---

## 10. Dependency Map

```
                    ┌──────────────┐
                    │ AI-1: Next.js │
                    │ Migration     │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ AI-2: AI SDK  │
                    │ Setup         │
                    └──────┬───────┘
                           │
              ┌────────────┼────────────┐
              │                         │
       ┌──────▼───────┐         ┌──────▼───────┐
       │ AI-3: Chat    │         │ Prompt Design │
       │ Panel UI      │         │ (parallel)    │
       └──────┬────────┘         └──────┬───────┘
              │                         │
              └────────────┬────────────┘
                           │
                    ┌──────▼───────┐
                    │ AI-4: Component│
                    │ Generation    │
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │ AI-5: Polish  │
                    │ & Guardrails  │
                    └──────────────┘
```

---

## 11. Alternative: Keep Vite + Add Standalone API Server

If the Next.js migration feels too risky or heavy, there's a lighter alternative:

**Keep Vite for the frontend**, add a tiny Express/Hono server in `apps/server/`:

```
apps/
├── builder/          # Stays Vite + React (unchanged)
├── server/           # NEW — Express server
│   ├── package.json
│   └── src/
│       ├── index.ts         # Express app
│       └── routes/
│           └── chat.ts      # AI chat endpoint
└── logic/            # Business Logic Builder
```

The `useChat` hook can point to any URL — it doesn't require Next.js:

```typescript
const { messages, sendMessage } = useChat({
  transport: new DefaultChatTransport({
    api: 'http://localhost:3001/api/chat',  // External server
  }),
});
```

**Pros:** Zero migration risk, both apps stay on Vite, server is minimal
**Cons:** Extra process to run, CORS config needed, slightly more infra

This is a valid fallback if Next.js migration hits friction.

---

## 12. Open Questions

1. **Model selection:** Should users pick the model (Claude Sonnet, GPT-4o, etc.) or should it be fixed? A dropdown adds flexibility but complexity.
2. **Token costs:** Component generation can use many tokens. Should there be a usage indicator / budget limit?
3. **Template library from AI:** Should the AI be able to generate and save "template" components to the component library? (e.g., "Save this pricing section as a reusable template")
4. **Multi-page generation:** Can the AI generate entire pages? Or only sections/components within a page?
5. **Image generation:** Should the AI suggest placeholder images from Unsplash/Pexels, or just use gray placeholders?
6. **Code view:** Should the AI be able to see and explain the generated HTML/React code?

---

## 13. Success Metrics

How to know if the AI integration is working well:

| Metric | Target |
|--------|--------|
| Valid JSON rate | > 95% of responses are valid ComponentNode[] |
| User acceptance rate | > 70% of generations get "Add to Canvas" clicked |
| Modification accuracy | > 80% of "modify" requests correctly update the right component |
| Average generation time | < 5 seconds for simple requests, < 15 for complex |
| Undo rate | < 30% (low = users are happy with results) |

---

**Document Version:** 1.0
**Created:** 2026-02-15
**Status:** Design Phase — Ready for review
