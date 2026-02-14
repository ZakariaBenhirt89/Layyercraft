# Business Logic Builder — Second Frontend

## Document Purpose

This document defines the architecture, design, and implementation path for the **Business Logic Builder** — a second frontend app within the Layercraft monorepo. This app allows users to define workflows, rules, events, data bindings, and behavioral logic for the components built in the first app (the UI Builder).

**Status:** Design Phase
**Version:** 1.0
**Date:** 2026-02-14

---

## 1. Why a Separate Frontend?

The UI Builder (App 1) focuses on **visual composition** — dragging, dropping, styling, and arranging components. The Business Logic Builder (App 2) focuses on **behavioral composition** — defining what happens when a user interacts with those components.

Separating them achieves:

| Concern | UI Builder | Business Logic Builder |
|---------|-----------|----------------------|
| Focus | Layout, style, structure | Events, data, workflows |
| Mental model | Visual / spatial | Logical / sequential |
| Complexity | Shallow (props, CSS) | Deep (state machines, conditions, API calls) |
| User persona | Designer / visual builder | Builder / product owner |
| Render target | Canvas + property panel | Flow editor + rule sheets |

Keeping both in a monorepo with shared packages means they share types, utilities, and component definitions without coupling their UIs.

---

## 2. Monorepo Structure

### 2.1 Proposed Directory Layout

```
/Tui (root)
├── package.json                    # Root workspace config
├── pnpm-workspace.yaml             # (or npm/yarn workspaces)
├── tsconfig.base.json              # Shared TypeScript config
├── CLAUDE.md
├── IMPLEMENTATION_PLAN.md
├── BUSINESS_LOGIC_BUILDER.md       # This document
│
├── packages/
│   ├── shared-types/               # Shared TypeScript types
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── component.ts        # ComponentNode, LayoutConfig (moved from apps/builder)
│   │       ├── behavior.ts         # Behavior, Action, Trigger types
│   │       ├── workflow.ts         # Workflow, Step, Condition types
│   │       ├── data.ts             # DataSource, DataBinding, Schema types
│   │       └── project.ts          # Project, Page, AppConfig types
│   │
│   ├── shared-utils/               # Shared utility functions
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── componentTree.ts    # Tree manipulation (moved from apps/builder)
│   │       ├── serialization.ts    # JSON import/export
│   │       └── validation.ts       # Schema & rule validation
│   │
│   └── shared-ui/                  # Shared UI components (optional, Phase 2)
│       ├── package.json
│       └── src/
│           ├── ComponentIcon.tsx   # Icon mapping for component types
│           └── ComponentBadge.tsx  # Status badges
│
├── apps/
│   ├── builder/                    # App 1 — UI Builder (existing code, relocated)
│   │   ├── package.json
│   │   ├── vite.config.ts
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.tsx
│   │       ├── app/
│   │       │   ├── App.tsx
│   │       │   └── components/     # All existing builder components
│   │       ├── stores/
│   │       ├── styles/
│   │       └── utils/              # Builder-specific utils only
│   │
│   └── logic/                      # App 2 — Business Logic Builder (NEW)
│       ├── package.json
│       ├── vite.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── app/
│           │   ├── App.tsx
│           │   └── components/     # Logic builder components
│           ├── stores/
│           ├── styles/
│           ├── engine/
│           └── utils/
│
├── logo/                           # Shared assets
└── guidelines/
```

### 2.2 Workspace Configuration

**Root `package.json`** should define workspaces:
```json
{
  "name": "layercraft",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "dev:builder": "pnpm --filter @layercraft/builder dev",
    "dev:logic": "pnpm --filter @layercraft/logic dev",
    "dev": "pnpm --parallel --filter './apps/*' dev",
    "build": "pnpm --parallel --filter './apps/*' build",
    "build:packages": "pnpm --filter './packages/*' build"
  }
}
```

### 2.3 Migration Steps (from current flat structure to monorepo)

1. Install pnpm (or configure npm/yarn workspaces)
2. Create `apps/builder/` and move all current `src/`, `index.html`, `vite.config.ts`, `package.json` into it
3. Extract `src/types/component.ts` into `packages/shared-types/`
4. Extract `src/utils/componentTree.ts` into `packages/shared-utils/`
5. Update imports in `apps/builder/` to point to `@layercraft/shared-types` and `@layercraft/shared-utils`
6. Create `apps/logic/` with a fresh Vite + React + TypeScript setup
7. Verify both apps run independently with `dev:builder` and `dev:logic`

---

## 3. Business Logic Builder — Core Concepts

The Logic Builder operates on a project's **component tree** (produced by the UI Builder) and lets users attach logic without writing code.

### 3.1 Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│  UI Builder produces:                                        │
│    ComponentNode[] (tree of visual components)               │
│                                                              │
│  Logic Builder consumes that tree and produces:              │
│    LogicLayer (events, bindings, workflows, state, API defs) │
│                                                              │
│  Runtime combines both to produce:                           │
│    A working interactive application                         │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 Key Abstractions

| Concept | What it is | Example |
|---------|-----------|---------|
| **Event Binding** | A trigger on a component that fires an action | "When Button-1 is clicked, submit Form-1" |
| **Data Source** | An external or internal data provider | REST API endpoint, localStorage, hardcoded JSON |
| **Data Binding** | Connecting a data source field to a component prop | `UserAPI.name` → `Text-3.content` |
| **Workflow** | A multi-step sequence of actions | "Validate form → call API → show toast → navigate" |
| **State Variable** | App-level reactive state | `isLoggedIn: boolean`, `cartItems: Item[]` |
| **Condition** | A boolean expression gating an action or visibility | `if cartItems.length > 0 then show CartBadge` |
| **Transformation** | Data mapping between shapes | `API response → flatten → filter → bind to list` |

---

## 4. Type System (packages/shared-types)

### 4.1 Core Logic Types

```typescript
// packages/shared-types/src/workflow.ts

export type Workflow = {
  id: string;
  name: string;
  description?: string;
  trigger: WorkflowTrigger;
  steps: WorkflowStep[];
  errorHandler?: WorkflowStep;
  enabled: boolean;
};

export type WorkflowTrigger = {
  type: 'component_event' | 'state_change' | 'data_change' | 'lifecycle' | 'schedule';
  componentId?: string;          // Which component triggers this
  event?: string;                // onClick, onSubmit, onHover, etc.
  stateKey?: string;             // For state_change triggers
  lifecycleEvent?: 'mount' | 'unmount' | 'route_change';
};

export type WorkflowStep = {
  id: string;
  type: StepType;
  config: StepConfig;
  next?: string;                 // ID of next step (linear flow)
  branches?: ConditionalBranch[]; // For conditional steps
  onError?: 'stop' | 'continue' | 'goto';
  errorGoto?: string;            // Step ID to jump to on error
};

export type StepType =
  | 'action'           // Do something (API call, state update, navigate)
  | 'condition'        // If/else branch
  | 'loop'             // Iterate over a collection
  | 'delay'            // Wait N ms
  | 'transform'        // Map/filter/reduce data
  | 'set_state'        // Update a state variable
  | 'emit_event'       // Fire a custom event
  | 'show_feedback'    // Toast, modal, alert
  | 'navigate';        // Route change

export type StepConfig = Record<string, any>; // Varies by StepType

export type ConditionalBranch = {
  id: string;
  condition: Condition;
  nextStepId: string;
};

export type Condition = {
  left: ValueReference;
  operator: '==' | '!=' | '>' | '<' | '>=' | '<=' | 'contains' | 'isEmpty' | 'isNotEmpty';
  right: ValueReference;
  logic?: 'and' | 'or';         // For compound conditions
  children?: Condition[];
};

export type ValueReference = {
  type: 'literal' | 'state' | 'component_prop' | 'data_source' | 'step_output';
  value: any;                    // Literal value or path string
};
```

### 4.2 Data Types

```typescript
// packages/shared-types/src/data.ts

export type DataSource = {
  id: string;
  name: string;
  type: 'rest_api' | 'graphql' | 'static_json' | 'local_storage' | 'websocket';
  config: DataSourceConfig;
  schema?: DataSchema;           // Expected response shape
  refreshPolicy?: 'manual' | 'on_mount' | 'interval' | 'on_event';
  refreshInterval?: number;      // ms, for interval policy
};

export type DataSourceConfig = {
  // REST API
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  // Static
  staticData?: any;
  // Auth
  auth?: {
    type: 'none' | 'bearer' | 'api_key' | 'basic';
    token?: string;
    headerName?: string;
  };
};

export type DataBinding = {
  id: string;
  sourceId: string;              // DataSource ID
  sourcePath: string;            // JSONPath or dot notation (e.g., "data.users[0].name")
  targetComponentId: string;     // Component to bind to
  targetProp: string;            // Which prop to set (e.g., "children", "src", "value")
  transform?: TransformPipeline; // Optional data transformation
};

export type TransformPipeline = {
  steps: TransformStep[];
};

export type TransformStep = {
  type: 'map' | 'filter' | 'sort' | 'slice' | 'flatten' | 'pick' | 'rename' | 'template';
  config: Record<string, any>;
};

export type DataSchema = {
  type: 'object' | 'array' | 'string' | 'number' | 'boolean';
  properties?: Record<string, DataSchema>;
  items?: DataSchema;
};
```

### 4.3 State Types

```typescript
// packages/shared-types/src/behavior.ts (extended)

export type AppState = {
  variables: StateVariable[];
  computed: ComputedVariable[];
};

export type StateVariable = {
  id: string;
  key: string;                   // e.g., "isLoggedIn", "cartItems"
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  defaultValue: any;
  scope: 'global' | 'page' | 'component';
  persist?: boolean;             // Save to localStorage
};

export type ComputedVariable = {
  id: string;
  key: string;                   // e.g., "cartTotal", "isFormValid"
  expression: string;            // e.g., "cartItems.reduce((sum, i) => sum + i.price, 0)"
  dependencies: string[];        // State keys this depends on
};
```

### 4.4 Project Type (ties everything together)

```typescript
// packages/shared-types/src/project.ts

export type Project = {
  id: string;
  name: string;
  version: string;
  pages: Page[];
  globalState: AppState;
  dataSources: DataSource[];
  theme?: ThemeConfig;
  settings?: ProjectSettings;
  createdAt: string;
  updatedAt: string;
};

export type Page = {
  id: string;
  name: string;
  route: string;                  // e.g., "/", "/dashboard", "/settings"
  componentTree: ComponentNode[]; // From UI Builder
  logicLayer: LogicLayer;         // From Logic Builder
  pageState?: AppState;           // Page-scoped state
};

export type LogicLayer = {
  workflows: Workflow[];
  dataBindings: DataBinding[];
  eventBindings: EventBinding[];
  conditions: VisibilityCondition[];
};

export type EventBinding = {
  id: string;
  componentId: string;
  event: string;                  // onClick, onSubmit, onChange, onHover, onFocus, onBlur
  workflowId?: string;           // Run a workflow
  action?: InlineAction;          // Or run a simple inline action
};

export type InlineAction = {
  type: 'navigate' | 'set_state' | 'toggle' | 'show_toast' | 'open_modal' | 'close_modal' | 'scroll_to';
  config: Record<string, any>;
};

export type VisibilityCondition = {
  componentId: string;
  condition: Condition;
  effect: 'show' | 'hide' | 'disable' | 'enable' | 'add_class' | 'remove_class';
  className?: string;             // For add_class/remove_class
};
```

---

## 5. Business Logic Builder — App Architecture

### 5.1 High-Level Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Top Bar                                                                      │
│  [Project Name] [Page Selector ▼] [Preview] [Export] [Sync with UI Builder]  │
├────────────┬─────────────────────────────────────────┬───────────────────────┤
│            │                                         │                       │
│  Component │           Main Workspace                │   Inspector Panel     │
│  Tree      │                                         │                       │
│  (Read-    │  ┌─────────────────────────────────┐   │   Context-sensitive:  │
│   only     │  │  Active Tab Content              │   │                       │
│   mirror   │  │                                  │   │   - Workflow config   │
│   of UI    │  │  Tab 1: Event Bindings           │   │   - Step editor       │
│   Builder) │  │  Tab 2: Workflow Editor           │   │   - Data source cfg  │
│            │  │  Tab 3: Data Sources & Bindings   │   │   - Binding config   │
│  Click a   │  │  Tab 4: State Manager             │   │   - Condition editor │
│  component │  │  Tab 5: Conditions & Visibility   │   │   - State variable   │
│  to see    │  │                                  │   │     editor            │
│  its       │  └─────────────────────────────────┘   │                       │
│  attached  │                                         │                       │
│  logic     │                                         │                       │
│            │                                         │                       │
├────────────┴─────────────────────────────────────────┴───────────────────────┤
│  Bottom Bar: Validation Errors | Warnings | Logic Coverage (X/Y components)  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Tab Breakdown

#### Tab 1: Event Bindings

**Purpose:** Attach events to components and define what happens.

```
┌─────────────────────────────────────────────────────────────┐
│  EVENT BINDINGS                                    [+ Add]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ Button "Sign Up" ─────────────────────────────────────┐ │
│  │  onClick → Run Workflow: "Submit Registration"          │ │
│  │  onHover → Inline: add_class("shadow-lg")              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Form "Login Form" ────────────────────────────────────┐ │
│  │  onSubmit → Run Workflow: "Authenticate User"           │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌─ Input "Email" ────────────────────────────────────────┐ │
│  │  onChange → Inline: set_state("email", event.value)     │ │
│  │  onBlur   → Run Workflow: "Validate Email"              │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                                              │
│  Components without events: 12 / 18                [Show ▼] │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 2: Workflow Editor

**Purpose:** Define multi-step logic flows visually.

This is the most complex tab. It uses a **vertical flow diagram** (not a full node graph — that's over-engineered for this use case).

```
┌─────────────────────────────────────────────────────────────┐
│  WORKFLOW: "Submit Registration"                  [Edit ✎]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ⬤ TRIGGER: Button "Sign Up" → onClick                     │
│  │                                                           │
│  ▼                                                           │
│  ┌───────────────────────────────────┐                       │
│  │ 1. Validate Form                  │                       │
│  │    Type: condition                │                       │
│  │    If: email.isNotEmpty AND       │                       │
│  │        password.length >= 8       │                       │
│  └────────────┬──────────┬───────────┘                       │
│          True ▼     False ▼                                  │
│  ┌────────────┐  ┌───────────────┐                           │
│  │ 2. Call API │  │ Show Error    │                           │
│  │ POST /reg.. │  │ "Fill all     │                           │
│  │             │  │  fields"      │                           │
│  └──────┬──────┘  └───────────────┘                          │
│         ▼                                                    │
│  ┌─────────────────────┐                                     │
│  │ 3. Set State         │                                    │
│  │    isLoggedIn = true  │                                   │
│  │    user = response    │                                   │
│  └──────┬───────────────┘                                    │
│         ▼                                                    │
│  ┌─────────────────────┐                                     │
│  │ 4. Navigate          │                                    │
│  │    → /dashboard      │                                   │
│  └─────────────────────┘                                     │
│                                                              │
│  [+ Add Step]                                                │
└─────────────────────────────────────────────────────────────┘
```

**Implementation approach:** Do NOT build a full drag-and-drop node graph (like n8n or Node-RED). Instead, use a **structured list/tree** of steps with indentation for branches. Reasons:

1. Simpler to implement
2. Easier to read for non-technical users
3. Fewer edge cases than a graph editor
4. Can always upgrade to a graph later

Each step is a card that can be:
- Clicked to edit in the Inspector Panel
- Dragged to reorder
- Deleted or duplicated
- Branched (for conditions)

#### Tab 3: Data Sources & Bindings

**Purpose:** Configure where data comes from and how it maps to components.

```
┌─────────────────────────────────────────────────────────────┐
│  DATA SOURCES                                      [+ Add]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─ 🌐 UserAPI ──────────────────────────────────────────┐  │
│  │  GET https://api.example.com/users                     │  │
│  │  Auth: Bearer token                                    │  │
│  │  Refresh: On mount                                     │  │
│  │  Schema: { users: [{ id, name, email, avatar }] }      │  │
│  │  Bindings: 3                              [Edit] [Test] │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─ 📦 StaticPricing ───────────────────────────────────┐   │
│  │  Type: Static JSON                                    │   │
│  │  { plans: [{ name: "Free", price: 0 }, ...] }         │   │
│  │  Bindings: 2                              [Edit] [Test] │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  DATA BINDINGS                                               │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  UserAPI.users[0].name  →  Text "Welcome"  .children        │
│  UserAPI.users[0].avatar → Image "Profile" .src             │
│  StaticPricing.plans     →  Container "Plans" .children     │
│                              (repeat template)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**"Test" button:** Fires the API call and shows the raw response + how it maps to the bound components. Essential for debugging.

#### Tab 4: State Manager

**Purpose:** Define and manage application state variables.

```
┌─────────────────────────────────────────────────────────────┐
│  STATE VARIABLES                                   [+ Add]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Scope: [Global ▼]                                          │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  isLoggedIn    boolean    default: false    persist ✓ │   │
│  │  Used by: 3 conditions, 1 workflow                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  currentUser   object     default: null               │   │
│  │  Used by: 2 bindings                                  │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  cartItems     array      default: []     persist ✓   │   │
│  │  Used by: 1 condition, 1 computed                     │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
│  COMPUTED                                          [+ Add]  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  cartTotal  = cartItems.reduce((s,i) => s+i.price,0) │   │
│  │  Depends on: cartItems                                │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### Tab 5: Conditions & Visibility

**Purpose:** Conditionally show/hide/enable/disable components based on state.

```
┌─────────────────────────────────────────────────────────────┐
│  VISIBILITY CONDITIONS                             [+ Add]  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Container "Admin Panel"                              │   │
│  │  SHOW when: currentUser.role == "admin"               │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Button "Checkout"                                    │   │
│  │  ENABLE when: cartItems.length > 0                    │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Text "Empty Cart Message"                            │   │
│  │  SHOW when: cartItems.length == 0                     │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  Badge "Cart Count"                                   │   │
│  │  HIDE when: cartItems isEmpty                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Component Tree (Left Sidebar)

The Logic Builder shows a **read-only mirror** of the component tree from the UI Builder. It does NOT allow structural changes (that's the UI Builder's job). Instead it:

- Shows which components have logic attached (badges/indicators)
- Clicking a component filters all tabs to show only that component's logic
- Provides a "coverage" metric: how many components have events/bindings vs. total

```
┌───────────────────────────┐
│  COMPONENTS        12/18  │  ← 12 of 18 have logic
├───────────────────────────┤
│  ▼ Page: Home             │
│    ▼ Container "Header"   │
│      ├─ Image "Logo"      │
│      └─ Button "Login" ⚡ │  ← ⚡ = has events
│    ▼ Container "Main"     │
│      ├─ Text "Welcome" 🔗 │  ← 🔗 = has data binding
│      ├─ Card "Feature" 👁  │  ← 👁 = has visibility condition
│      └─ Form "Signup" ⚡🔗 │
│    ▼ Container "Footer"   │
│      └─ Text "Copyright"  │
└───────────────────────────┘
```

---

## 7. Inspector Panel (Right Sidebar)

Context-sensitive panel that changes based on what's selected in the main workspace.

### 7.1 When editing a Workflow Step:

```
┌──────────────────────────────┐
│  STEP: Call API               │
├──────────────────────────────┤
│  Type: [Action ▼]            │
│  Action: [API Call ▼]        │
│                               │
│  URL: [________________]     │
│  Method: [POST ▼]            │
│  Headers:                     │
│    Content-Type: app/json    │
│    [+ Add Header]            │
│                               │
│  Body:                        │
│  ┌────────────────────────┐  │
│  │ {                       │  │
│  │   "email": {{email}},   │  │
│  │   "pass": {{password}}  │  │
│  │ }                       │  │
│  └────────────────────────┘  │
│                               │
│  On Success: → Next Step     │
│  On Error: [Show Error ▼]    │
│                               │
│  Output Variable:             │
│  [apiResponse__________]     │
│                               │
│  [Test This Step]  [Delete]  │
└──────────────────────────────┘
```

### 7.2 When editing a Data Binding:

```
┌──────────────────────────────┐
│  DATA BINDING                 │
├──────────────────────────────┤
│  Source: [UserAPI ▼]         │
│  Path: [users[0].name____]  │
│                               │
│  Preview: "John Doe"         │
│                               │
│  Transform Pipeline:          │
│  ┌────────────────────────┐  │
│  │ 1. [None]              │  │
│  │ [+ Add Transform]      │  │
│  └────────────────────────┘  │
│                               │
│  Target Component:            │
│  [Text "Welcome" ▼]         │
│  Target Prop: [children ▼]   │
│                               │
│  Result Preview:              │
│  "Welcome, John Doe"         │
│                               │
│  [Save]  [Remove Binding]    │
└──────────────────────────────┘
```

### 7.3 When editing a Condition:

```
┌──────────────────────────────┐
│  CONDITION EDITOR             │
├──────────────────────────────┤
│  ┌────────────────────────┐  │
│  │ [State: cartItems ▼]   │  │
│  │ [.length         ▼]   │  │
│  │ [>               ▼]   │  │
│  │ [0_______________  ]   │  │
│  └────────────────────────┘  │
│                               │
│  [+ AND condition]           │
│  [+ OR condition]            │
│                               │
│  Evaluates to: true          │
│                               │
│  [Save]  [Delete]            │
└──────────────────────────────┘
```

---

## 8. Communication Between Apps

The UI Builder and Logic Builder need to share the component tree. Options:

### 8.1 File-Based Sync (Recommended for MVP)

Both apps read/write a shared `project.json` file:

```
project.json
├── pages[].componentTree    ← Written by UI Builder
├── pages[].logicLayer       ← Written by Logic Builder
├── globalState              ← Written by Logic Builder
└── dataSources              ← Written by Logic Builder
```

**Flow:**
1. UI Builder saves the component tree to `project.json`
2. Logic Builder reads the component tree from `project.json` (read-only)
3. Logic Builder saves its logic layer to `project.json`
4. Preview/Runtime reads both from `project.json`

### 8.2 SharedWorker / BroadcastChannel (Recommended for real-time)

If both apps run simultaneously, use `BroadcastChannel` API to sync changes in real-time:

```typescript
// In UI Builder
const channel = new BroadcastChannel('layercraft-sync');
channel.postMessage({ type: 'TREE_UPDATED', payload: componentTree });

// In Logic Builder
const channel = new BroadcastChannel('layercraft-sync');
channel.onmessage = (event) => {
  if (event.data.type === 'TREE_UPDATED') {
    setComponentTree(event.data.payload);
  }
};
```

### 8.3 Backend API (Future)

When a backend is introduced, both apps communicate via a REST/WebSocket API. The project is stored server-side, and both apps are clients.

---

## 9. Implementation Phases

### Phase L1: Monorepo Setup & Scaffold (Foundation)

**Goal:** Restructure into monorepo, scaffold the Logic Builder app.

**Tasks:**
- [ ] Set up pnpm workspaces
- [ ] Move existing code into `apps/builder/`
- [ ] Extract shared types into `packages/shared-types/`
- [ ] Extract shared utils into `packages/shared-utils/`
- [ ] Scaffold `apps/logic/` with Vite + React + TypeScript + Tailwind
- [ ] Verify both apps run independently
- [ ] Set up shared tsconfig

**Estimated complexity:** Low-medium. Mostly file moves and config.

---

### Phase L2: Component Tree Mirror (Left Sidebar)

**Goal:** Display the UI Builder's component tree in the Logic Builder (read-only).

**Tasks:**
- [ ] Implement project.json read/write in UI Builder
- [ ] Implement project.json import in Logic Builder
- [ ] Build read-only ComponentTreePanel
- [ ] Add logic indicators (event, binding, condition badges)
- [ ] Add coverage metric display
- [ ] Component click → filter all tabs

**Key files to create:**
```
apps/logic/src/app/components/ComponentTreePanel.tsx
apps/logic/src/app/components/ComponentTreeItem.tsx
apps/logic/src/stores/projectStore.ts
apps/logic/src/utils/projectSync.ts
```

---

### Phase L3: Event Bindings (Tab 1)

**Goal:** Allow users to attach events to components and define simple actions.

**Tasks:**
- [ ] Build EventBindingsTab component
- [ ] Build EventBindingCard component
- [ ] Build InlineActionEditor (for simple actions without workflows)
- [ ] Implement event type selector (onClick, onChange, onSubmit, etc.)
- [ ] Implement action type selector (navigate, set_state, toggle, show_toast)
- [ ] Wire up to projectStore

**Key files:**
```
apps/logic/src/app/components/tabs/EventBindingsTab.tsx
apps/logic/src/app/components/EventBindingCard.tsx
apps/logic/src/app/components/InlineActionEditor.tsx
```

---

### Phase L4: State Manager (Tab 4)

**Goal:** Define and manage state variables.

**Why before workflows?** Workflows reference state variables, so state management should exist first.

**Tasks:**
- [ ] Build StateManagerTab
- [ ] Build StateVariableEditor
- [ ] Build ComputedVariableEditor
- [ ] Implement variable type validation
- [ ] Show "used by" references
- [ ] Implement scope (global vs. page)
- [ ] Implement persist flag (localStorage)

**Key files:**
```
apps/logic/src/app/components/tabs/StateManagerTab.tsx
apps/logic/src/app/components/StateVariableEditor.tsx
apps/logic/src/app/components/ComputedVariableEditor.tsx
```

---

### Phase L5: Workflow Editor (Tab 2)

**Goal:** Build the core workflow authoring experience.

**Tasks:**
- [ ] Build WorkflowEditorTab (list of workflows)
- [ ] Build WorkflowCanvas (vertical step flow)
- [ ] Build WorkflowStepCard (individual step UI)
- [ ] Implement step types: action, condition, set_state, navigate, show_feedback, delay
- [ ] Build step Inspector panel editors for each step type
- [ ] Implement drag-to-reorder steps
- [ ] Implement conditional branching (if/else visual)
- [ ] Implement error handling config per step
- [ ] Add "Test Workflow" button (dry-run simulation)

**Key files:**
```
apps/logic/src/app/components/tabs/WorkflowEditorTab.tsx
apps/logic/src/app/components/workflow/WorkflowCanvas.tsx
apps/logic/src/app/components/workflow/WorkflowStepCard.tsx
apps/logic/src/app/components/workflow/StepInspector.tsx
apps/logic/src/app/components/workflow/ConditionBranchView.tsx
apps/logic/src/app/components/workflow/TriggerSelector.tsx
```

**Design decisions:**
- Use a vertical list (NOT a node graph) for step display
- Steps are cards stacked vertically with arrows between them
- Conditions create indented branches
- Loops show a "repeat" indicator
- Keep it simple — users can always view the JSON if they want advanced control

---

### Phase L6: Data Sources & Bindings (Tab 3)

**Goal:** Connect external data to components.

**Tasks:**
- [ ] Build DataSourcesTab
- [ ] Build DataSourceEditor (create/edit data sources)
- [ ] Build DataSourceTester (fire request, show response)
- [ ] Build DataBindingEditor (map source fields to component props)
- [ ] Build TransformPipelineEditor (map, filter, sort, etc.)
- [ ] Implement schema inference from API response
- [ ] Build binding preview (show what value would be set)

**Key files:**
```
apps/logic/src/app/components/tabs/DataSourcesTab.tsx
apps/logic/src/app/components/data/DataSourceEditor.tsx
apps/logic/src/app/components/data/DataSourceTester.tsx
apps/logic/src/app/components/data/DataBindingEditor.tsx
apps/logic/src/app/components/data/TransformPipelineEditor.tsx
apps/logic/src/app/components/data/SchemaViewer.tsx
```

---

### Phase L7: Conditions & Visibility (Tab 5)

**Goal:** Conditionally control component visibility and state based on conditions.

**Tasks:**
- [ ] Build ConditionsTab
- [ ] Build ConditionEditor (visual condition builder)
- [ ] Build ConditionRow (single condition with operator)
- [ ] Implement compound conditions (AND/OR groups)
- [ ] Implement effects (show, hide, enable, disable, add_class, remove_class)
- [ ] Show real-time evaluation preview

**Key files:**
```
apps/logic/src/app/components/tabs/ConditionsTab.tsx
apps/logic/src/app/components/conditions/ConditionEditor.tsx
apps/logic/src/app/components/conditions/ConditionRow.tsx
apps/logic/src/app/components/conditions/ConditionGroupEditor.tsx
```

---

### Phase L8: Inspector Panel (Right Sidebar)

**Goal:** Context-sensitive editing panel.

**Tasks:**
- [ ] Build InspectorPanel container with dynamic content
- [ ] Build WorkflowStepInspector
- [ ] Build DataBindingInspector
- [ ] Build ConditionInspector
- [ ] Build StateVariableInspector
- [ ] Build EventBindingInspector
- [ ] Implement "Test" buttons for each inspector type

**Key files:**
```
apps/logic/src/app/components/inspector/InspectorPanel.tsx
apps/logic/src/app/components/inspector/WorkflowStepInspector.tsx
apps/logic/src/app/components/inspector/DataBindingInspector.tsx
apps/logic/src/app/components/inspector/ConditionInspector.tsx
```

---

### Phase L9: Validation & Error Reporting (Bottom Bar)

**Goal:** Catch logic errors before runtime.

**Validations to implement:**
- Workflow references deleted component → Error
- Data binding targets nonexistent prop → Error
- State variable referenced but never set → Warning
- Circular workflow references → Error
- API URL is empty → Error
- Condition references unknown state key → Error
- Orphan workflows (no trigger) → Warning
- Duplicate event bindings on same component+event → Warning

**Key files:**
```
apps/logic/src/app/components/ValidationBar.tsx
apps/logic/src/utils/logicValidator.ts
```

---

### Phase L10: Preview & Runtime Engine (Future)

**Goal:** Execute the combined UI + Logic in a live preview.

This is a **third concern** (possibly a third app or an iframe within either app) that:
1. Reads the component tree
2. Reads the logic layer
3. Renders React components with event handlers wired up
4. Manages runtime state
5. Executes workflows when triggers fire
6. Fetches data from data sources
7. Evaluates conditions for visibility

**Key files (future):**
```
apps/logic/src/engine/runtimeEngine.ts    # Or separate apps/preview/
apps/logic/src/engine/workflowExecutor.ts
apps/logic/src/engine/stateManager.ts
apps/logic/src/engine/dataFetcher.ts
apps/logic/src/engine/conditionEvaluator.ts
```

---

## 10. State Management (Logic Builder)

### Recommended: Zustand

```typescript
// apps/logic/src/stores/projectStore.ts
interface ProjectStore {
  project: Project | null;
  activePageId: string | null;
  activeTab: 'events' | 'workflows' | 'data' | 'state' | 'conditions';
  selectedComponentId: string | null;
  selectedWorkflowId: string | null;
  selectedStepId: string | null;

  // Project actions
  loadProject: (json: string) => void;
  saveProject: () => string;

  // Page actions
  setActivePage: (pageId: string) => void;

  // Component tree (read-only)
  getComponentTree: () => ComponentNode[];

  // Event bindings
  addEventBinding: (binding: EventBinding) => void;
  updateEventBinding: (id: string, updates: Partial<EventBinding>) => void;
  removeEventBinding: (id: string) => void;

  // Workflows
  addWorkflow: (workflow: Workflow) => void;
  updateWorkflow: (id: string, updates: Partial<Workflow>) => void;
  removeWorkflow: (id: string) => void;
  addWorkflowStep: (workflowId: string, step: WorkflowStep, afterStepId?: string) => void;
  removeWorkflowStep: (workflowId: string, stepId: string) => void;

  // Data sources
  addDataSource: (source: DataSource) => void;
  updateDataSource: (id: string, updates: Partial<DataSource>) => void;
  removeDataSource: (id: string) => void;

  // Data bindings
  addDataBinding: (binding: DataBinding) => void;
  removeDataBinding: (id: string) => void;

  // State variables
  addStateVariable: (variable: StateVariable) => void;
  updateStateVariable: (id: string, updates: Partial<StateVariable>) => void;
  removeStateVariable: (id: string) => void;

  // Conditions
  addVisibilityCondition: (condition: VisibilityCondition) => void;
  removeVisibilityCondition: (id: string) => void;
}
```

---

## 11. Design Principles

1. **No code required.** Everything is configurable through UI. Power users can view/edit the JSON directly, but it's never required.

2. **Progressive disclosure.** Start with simple event → action bindings. Only show workflows when the user needs multi-step logic. Only show transforms when data doesn't map 1:1.

3. **Always testable.** Every step, binding, and condition should have a "Test" button that shows what would happen without side effects.

4. **Validation-first.** Show errors and warnings immediately. Don't let users save broken logic if possible.

5. **Non-destructive sync.** The Logic Builder never modifies the component tree. It only reads it. The UI Builder never modifies the logic layer.

6. **Familiar patterns.** Event bindings work like Webflow. Workflows work like Zapier (linear steps). State works like React useState. Conditions work like spreadsheet IF().

---

## 12. Technology Choices (Same Stack)

| Concern | Tool | Why |
|---------|------|-----|
| Framework | React 18 | Same as UI Builder, shared components |
| Build | Vite | Same as UI Builder, fast HMR |
| Language | TypeScript | Shared types across apps |
| Styling | Tailwind CSS 4 | Same as UI Builder |
| UI primitives | Radix UI + shadcn/ui | Same as UI Builder |
| State | Zustand | Lightweight, TypeScript-native |
| Icons | Lucide React | Same as UI Builder |
| DnD (workflow steps) | react-dnd | Same as UI Builder, for step reordering |
| JSON editor | Monaco Editor (optional) | For power users editing raw JSON |
| Notifications | Sonner | Same as UI Builder |

---

## 13. File Structure Summary (Logic Builder App)

```
apps/logic/src/
├── main.tsx
├── app/
│   ├── App.tsx
│   └── components/
│       ├── TopBar.tsx
│       ├── ComponentTreePanel.tsx
│       ├── ComponentTreeItem.tsx
│       ├── InspectorPanel.tsx
│       ├── ValidationBar.tsx
│       │
│       ├── tabs/
│       │   ├── EventBindingsTab.tsx
│       │   ├── WorkflowEditorTab.tsx
│       │   ├── DataSourcesTab.tsx
│       │   ├── StateManagerTab.tsx
│       │   └── ConditionsTab.tsx
│       │
│       ├── workflow/
│       │   ├── WorkflowCanvas.tsx
│       │   ├── WorkflowStepCard.tsx
│       │   ├── ConditionBranchView.tsx
│       │   └── TriggerSelector.tsx
│       │
│       ├── data/
│       │   ├── DataSourceEditor.tsx
│       │   ├── DataSourceTester.tsx
│       │   ├── DataBindingEditor.tsx
│       │   ├── TransformPipelineEditor.tsx
│       │   └── SchemaViewer.tsx
│       │
│       ├── conditions/
│       │   ├── ConditionEditor.tsx
│       │   ├── ConditionRow.tsx
│       │   └── ConditionGroupEditor.tsx
│       │
│       ├── inspector/
│       │   ├── WorkflowStepInspector.tsx
│       │   ├── DataBindingInspector.tsx
│       │   ├── ConditionInspector.tsx
│       │   ├── StateVariableInspector.tsx
│       │   └── EventBindingInspector.tsx
│       │
│       ├── state/
│       │   ├── StateVariableEditor.tsx
│       │   └── ComputedVariableEditor.tsx
│       │
│       ├── events/
│       │   ├── EventBindingCard.tsx
│       │   └── InlineActionEditor.tsx
│       │
│       └── shared/
│           ├── ValueReferenceSelector.tsx   # Pick state/prop/literal/data source
│           ├── ComponentSelector.tsx        # Dropdown to pick a component
│           └── JsonEditor.tsx              # Raw JSON view/edit
│
├── stores/
│   ├── projectStore.ts
│   └── uiStore.ts                          # UI-only state (active tab, selections)
│
├── utils/
│   ├── logicValidator.ts
│   └── projectSync.ts
│
├── engine/                                 # Preview/runtime (Phase L10)
│   ├── runtimeEngine.ts
│   ├── workflowExecutor.ts
│   ├── stateManager.ts
│   ├── dataFetcher.ts
│   └── conditionEvaluator.ts
│
└── styles/
    ├── index.css
    └── tailwind.css
```

---

## 14. Recommended Implementation Order

```
Priority 1: Foundation
  L1  Monorepo setup & scaffold               ← Start here
  L2  Component tree mirror (left sidebar)

Priority 2: Core Logic Features
  L3  Event bindings (simplest logic)
  L4  State manager (needed by everything else)
  L5  Workflow editor (core value prop)

Priority 3: Data & Conditions
  L6  Data sources & bindings
  L7  Conditions & visibility

Priority 4: Polish
  L8  Inspector panel (context-sensitive)
  L9  Validation & error reporting

Priority 5: Runtime
  L10 Preview & runtime engine
```

---

## 15. Open Questions (To Decide During Implementation)

1. **Routing:** Should the Logic Builder handle page/route definitions, or should that be in the UI Builder?
2. **Auth:** Should authentication configuration be a dedicated section or just another data source?
3. **Custom code escape hatch:** Should users be able to write raw JavaScript for advanced logic? If so, how to sandbox it?
4. **Versioning:** Should logic layers be versioned independently of the component tree?
5. **Collaboration:** If two people work on UI and logic simultaneously, how to handle merge conflicts in `project.json`?
6. **Template library:** Should there be pre-built workflow templates (login flow, CRUD, checkout)?

---

**Document Version:** 1.0
**Created:** 2026-02-14
**Status:** Design Phase — Ready for review
