# Layercraft UI Builder — Architecture Documentation

## Overview

Layercraft (Tui) is a **drag-and-drop visual UI builder** built with React 18 + TypeScript on the frontend and Express.js on the backend. It features multi-model AI integration for component generation, real-time editing, and code export.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18.3.1 + TypeScript |
| Build Tool | Vite 6.3.5 |
| Styling | Tailwind CSS 4.1.12 |
| UI Primitives | Radix UI (50+ components) |
| Drag & Drop | react-dnd (HTML5Backend) |
| Icons | lucide-react |
| Animations | motion |
| Backend | Express.js 4.21 + TypeScript |
| AI SDK | Vercel AI SDK (`ai`, `@ai-sdk/openai`, `@ai-sdk/google`) |
| Validation | Zod |

---

## Project Structure

```
Tui/
├── src/                              # Frontend source
│   ├── main.tsx                      # Entry point
│   ├── app/
│   │   ├── App.tsx                   # Root component & state orchestrator
│   │   └── components/
│   │       ├── Toolbar.tsx           # View mode, theme, code/AI toggles
│   │       ├── ComponentLibrary.tsx  # Draggable component palette
│   │       ├── Canvas.tsx            # Main editor area + code view
│   │       ├── DropZone.tsx          # Drag-and-drop target handler
│   │       ├── ComponentRenderer.tsx # Recursive component tree renderer
│   │       ├── PropertiesPanel.tsx   # Property inspector (right sidebar)
│   │       ├── AIChatPanel.tsx       # AI assistant chat interface
│   │       ├── figma/                # Figma integration components
│   │       └── ui/                   # Radix UI component library
│   ├── types/
│   │   ├── component.ts             # ComponentNode, LayoutConfig, Behavior
│   │   └── aiChat.ts                # AI request/response types
│   ├── utils/
│   │   ├── componentTree.ts         # Tree CRUD operations
│   │   ├── componentTypes.ts        # Allowed types & container checks
│   │   ├── aiChat.ts                # AI API client
│   │   └── aiValidation.ts          # AI response validation & normalization
│   └── styles/
│       ├── index.css
│       ├── fonts.css
│       ├── tailwind.css
│       └── theme.css
│
├── server/                           # Backend API
│   ├── src/
│   │   ├── index.ts                 # Express app setup (port 3001)
│   │   ├── routes/
│   │   │   └── chat.ts              # AI chat endpoint with model routing
│   │   └── prompts/
│   │       └── system.ts            # System prompt builder
│   ├── package.json
│   └── tsconfig.json
│
├── index.html                        # HTML entry
├── vite.config.ts                    # Vite config
├── package.json                      # Frontend dependencies
└── docs/                             # Documentation
```

---

## Frontend Architecture

### Component Hierarchy

```
App (Root — state orchestrator)
├── Toolbar
│   ├── View mode selector (Desktop / Tablet / Mobile)
│   ├── Theme selector (Light / Dark / System)
│   ├── Code/AI toggle buttons
│   ├── Clear Canvas
│   └── Export (stub)
│
├── ComponentLibrary (left sidebar)
│   └── DraggableComponent × 11 variants
│       (Button, Input, Heading, Text, Card, Container, Image)
│
├── Canvas (center)
│   ├── CodeView (when showCode = true)
│   └── DropZone (when showCode = false)
│       └── ComponentRenderer (recursive)
│           ├── renderLeaf()      → Button, Input, Text, Heading, Image
│           └── renderContainer() → Container, Card (with nested children)
│
└── Right Sidebar
    ├── Layers Panel (tree view)
    └── AIChatPanel OR PropertiesPanel
```

### State Management

State lives in `App.tsx` using React hooks — no external state library.

| State | Type | Purpose |
|-------|------|---------|
| `components` | `ComponentNode[]` | Component tree on canvas |
| `viewMode` | `'desktop' \| 'tablet' \| 'mobile'` | Responsive preview |
| `showCode` | `boolean` | Toggle visual/code view |
| `selectedComponentId` | `string \| null` | Currently selected component |
| `rightPanelMode` | `'inspector' \| 'ai'` | Right sidebar content |

### State Actions

| Action | Utility | Description |
|--------|---------|-------------|
| `addComponent()` | `componentTree.addComponent()` | Add to root or nested |
| `removeComponent()` | `componentTree.removeComponent()` | Remove by ID |
| `updateComponent()` | `componentTree.updateComponent()` | Update single node |
| `applyAIComponents()` | — | Batch add AI-generated components |
| `applyAIModifications()` | — | Batch update via AI |

### Data Flow

```
ComponentLibrary (useDrag)
    ↓ drag event
DropZone (useDrop)
    ↓ onDrop(type, parentId)
App.addComponent()
    ↓
componentTree.addComponent(tree, node, parentId)
    ↓ immutable update
App.setComponents(newTree)
    ↓ re-render
ComponentRenderer.renderNode()
```

---

## Backend Architecture

### Server Setup

- **Express** on port 3001 (configurable via `PORT` env)
- **CORS** enabled for `localhost:5173` (Vite dev) and `localhost:4173` (preview)

### API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Health check |
| `POST` | `/api/chat` | AI chat — main endpoint |

### AI Chat Request (Zod-validated)

```typescript
{
  messages: Array<{ role: 'user' | 'assistant', content: string }>,
  componentTree: unknown,
  selectedComponentId?: string | null,
  viewMode: string,          // default: 'desktop'
  model: string              // default: 'anthropic/claude-sonnet-4-5-20250929'
}
```

### AI Chat Response

```typescript
{
  intent: 'create' | 'modify' | 'delete' | 'explain',
  components?: ComponentNode[],
  modifications?: Array<{ componentId: string, updates: Partial<ComponentNode> }>,
  message?: string
}
```

### Model Routing

| Prefix | Provider | API Key |
|--------|----------|---------|
| `google/*` | Google Gemini | `GEMINI_API_KEY` |
| `ollama/*` | Local Ollama (localhost:11434) | — |
| Other | OpenRouter (Claude, GPT-4o, etc.) | `OPENROUTER_API_KEY` |

---

## Core Types

### ComponentNode

```typescript
type ComponentNode = {
  id: string
  type: string                        // Button, Input, Heading, Text, Card, Container, Image
  props: Record<string, any>
  children: ComponentNode[]
  behaviors?: Behavior[]
  layoutConfig?: LayoutConfig
  parentId?: string | null
}
```

### LayoutConfig

```typescript
type LayoutConfig = {
  flexDirection?: 'row' | 'column'
  justifyContent?: string
  alignItems?: string
  gap?: string
  padding?: string
  width?: string
  height?: string
}
```

### Behavior

```typescript
type Behavior = {
  id: string
  trigger: 'onClick' | 'onHover' | 'onFocus' | 'onLoad'
  action: 'navigate' | 'toggle' | 'submit' | 'custom'
  target?: string
  params?: Record<string, any>
}
```

---

## Key Patterns

### Drag & Drop
- `react-dnd` with `HTML5Backend`
- `DndProvider` wraps the entire App
- `ComponentLibrary` uses `useDrag()` for draggable items
- `Canvas`/`ComponentRenderer` uses `useDrop()` with `parentId` tracking for nested drops

### Immutable State Updates
- All tree mutations use functional, recursive traversal with spreading
- No direct mutations — ensures React change detection works correctly

### AI Integration
- Chat-based interface with message history
- Multi-model support via provider routing
- Full component tree sent as context in each request
- Response validated with Zod schemas
- Supports request cancellation via `AbortController`

### Code Generation
- Client-side JSX generation in `Canvas.generateCode()`
- Recursive rendering with proper indentation
- Copy-to-clipboard support

### Theme System
- System preference detection via `window.matchMedia()`
- `localStorage` persistence
- Class toggle on `documentElement` for Tailwind dark mode

### Responsive Preview
- View mode selector: Desktop / Tablet / Mobile
- Canvas adapts width: `max-w-6xl` / `max-w-2xl` / `max-w-sm`

---

## Component Types

| Type | Container? | Variants in Library |
|------|-----------|-------------------|
| Button | No | Primary, Secondary, Outline |
| Input | No | Text, Email |
| Heading | No | Large (h1), Medium (h2) |
| Text | No | Paragraph |
| Card | Yes | Standard, Featured (gradient) |
| Container | Yes | Standard, Flex |
| Image | No | Placeholder |

---

## Environment Variables

| Variable | Location | Default | Description |
|----------|----------|---------|-------------|
| `VITE_AI_CHAT_ENDPOINT` | Frontend | `/api/chat` | AI endpoint URL |
| `PORT` | Backend | `3001` | Server port |
| `DEFAULT_MODEL` | Backend | `anthropic/claude-sonnet-4-5-20250929` | Default AI model |
| `OPENROUTER_API_KEY` | Backend | — | OpenRouter API key |
| `GEMINI_API_KEY` | Backend | — | Google Gemini API key |
| `OLLAMA_BASE_URL` | Backend | `http://localhost:11434` | Ollama base URL |

---

## Development

```bash
# Frontend (localhost:5173)
npm run dev

# Backend (localhost:3001)
cd server && npm run dev
```

---

## Key Dependencies

### Frontend
- `react` / `react-dom` 18.3.1 — UI framework
- `react-dnd` 16.0.1 — Drag and drop
- `@radix-ui/*` — Accessible UI primitives
- `tailwindcss` 4.1.12 — Utility-first CSS
- `lucide-react` 0.487.0 — Icons
- `motion` 12.23.24 — Animations
- `recharts` 2.15.2 — Charts
- `react-hook-form` 7.55.0 — Forms
- `sonner` 2.0.3 — Toast notifications

### Backend
- `express` 4.21 — HTTP server
- `ai` 4.1 — Vercel AI SDK
- `@ai-sdk/openai` 1.1 — OpenRouter + Ollama
- `@ai-sdk/google` 1.1 — Google Gemini
- `zod` 3.23 — Schema validation
- `cors` 2.8.5 — CORS middleware
