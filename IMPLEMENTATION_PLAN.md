# UI Builder Implementation & Design Plan

## Current State Analysis

Your project already has:
- ✅ Basic drag-and-drop UI builder
- ✅ Component library (ComponentLibrary.tsx) with predefined components
- ✅ Canvas area for dropping components
- ✅ Code generation functionality
- ✅ Responsive view modes (desktop/tablet/mobile)
- ✅ Rich component library (50+ shadcn/ui components in `src/app/components/ui/`)

**Technology Stack:**
- React 18.3.1
- Vite 6.3.5
- TypeScript
- Tailwind CSS 4.1.12
- react-dnd (drag and drop)
- Radix UI + shadcn/ui components
- Lucide React icons

**Gaps Identified:**
- ❌ No component nesting/stacking system
- ❌ No custom component builder
- ❌ No behavior/interaction logic implementation
- ❌ No layout analysis/smart positioning
- ❌ No property editor for runtime customization
- ❌ No component tree structure for nested layouts

---

## Implementation & Design Path

### Phase 1: Component Tree & Nesting System

**Goal:** Enable hierarchical component structure with parent-child relationships

**New Types & Data Structure:**

Create new file: `src/types/component.ts`

```typescript
export type ComponentNode = {
  id: string;
  type: string;
  props: Record<string, any>;
  children: ComponentNode[]; // Changed from string to nested components
  behaviors?: Behavior[];
  layoutConfig?: LayoutConfig;
  parentId?: string | null;
};

export type LayoutConfig = {
  flexDirection?: 'row' | 'column';
  justifyContent?: string;
  alignItems?: string;
  gap?: string;
  padding?: string;
  width?: string;
  height?: string;
};

export type Behavior = {
  id: string;
  trigger: 'onClick' | 'onHover' | 'onFocus' | 'onLoad';
  action: 'navigate' | 'toggle' | 'submit' | 'custom';
  target?: string;
  params?: Record<string, any>;
};
```

**Key Changes:**
1. Transform flat `ComponentType[]` to tree structure `ComponentNode[]`
2. Add `parentId` tracking for nested relationships
3. Support dropping components INTO containers

**Files to Modify:**
- `src/app/App.tsx` - Update state from `ComponentType[]` to `ComponentNode[]`
- `src/app/components/Canvas.tsx` - Update rendering logic

**Files to Create:**
- `src/types/component.ts` - Type definitions
- `src/utils/componentTree.ts` - Tree manipulation utilities

---

### Phase 2: Advanced Canvas with Drop Zones

**Goal:** Support nested drag-and-drop with visual drop zones

**Features:**
- Visual indicators when hovering over valid drop targets
- Support for dropping components into containers
- Recursive component rendering for nested structures
- Depth-based indentation in layers panel

**Implementation Details:**
- Create `DropZone` component for container-type elements
- Implement tree traversal for rendering nested components
- Add visual feedback for valid drop targets
- Support reordering components within the same parent

**Files to Create:**
- `src/app/components/DropZone.tsx` - Handles nested drop logic
- `src/app/components/ComponentRenderer.tsx` - Recursive component rendering
- `src/utils/componentTree.ts` - Tree manipulation utilities (add, remove, move, reorder)

**Example Tree Utilities:**
```typescript
// src/utils/componentTree.ts
export const addComponent = (tree: ComponentNode[], component: ComponentNode, parentId?: string) => { ... }
export const removeComponent = (tree: ComponentNode[], id: string) => { ... }
export const moveComponent = (tree: ComponentNode[], id: string, newParentId: string, index: number) => { ... }
export const updateComponent = (tree: ComponentNode[], id: string, updates: Partial<ComponentNode>) => { ... }
export const findComponent = (tree: ComponentNode[], id: string) => { ... }
```

---

### Phase 3: Properties Panel

**Goal:** Real-time component customization

**Features:**
- Select components to edit their properties
- Dynamic property forms based on component type
- Live preview updates
- Style editor (colors, spacing, typography, borders, shadows)
- Layout controls (flexbox, grid, positioning)
- Content editor (text, images, links)

**UI Layout:**
Replace the right sidebar in `App.tsx` (lines 86-119) with a comprehensive properties panel

**Files to Create:**
- `src/app/components/PropertiesPanel.tsx` - Main properties container
- `src/app/components/editors/StyleEditor.tsx` - Visual style controls
- `src/app/components/editors/LayoutEditor.tsx` - Layout and positioning
- `src/app/components/editors/ContentEditor.tsx` - Content and text editing
- `src/app/components/editors/PropertyInput.tsx` - Reusable input components

**Property Categories:**
1. **Content** - Text, images, icons, children
2. **Layout** - Display, flexbox, grid, spacing
3. **Style** - Colors, typography, borders, shadows
4. **Advanced** - Custom CSS, classes, IDs

---

### Phase 4: Custom Component Builder

**Goal:** Create reusable composite components

**Features:**
- "Create Component" modal to combine multiple components
- Save custom components to library
- Edit and update custom component definitions
- Import/export component definitions (JSON)
- Component variants (different configurations of the same component)

**Implementation:**
- Add "Save as Component" button when multiple components are selected
- Store custom components in localStorage or backend
- Add custom components section to ComponentLibrary
- Allow editing of saved components

**Files to Create:**
- `src/app/components/CustomComponentBuilder.tsx` - Main builder interface
- `src/app/components/ComponentTemplateModal.tsx` - Modal for creating/editing
- `src/stores/customComponents.ts` - State management for custom components
- `src/utils/componentSerialization.ts` - Save/load/export logic

**Data Structure:**
```typescript
export type CustomComponent = {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  template: ComponentNode; // Root node of the component tree
  variants?: ComponentVariant[];
  category?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

---

### Phase 5: Behavior System

**Goal:** Add interactivity without code

**Features:**
- Visual behavior editor
- Event triggers (click, hover, focus, form submit, load)
- Actions (navigate, show/hide, state change, API call, custom)
- Conditional logic (if/else)
- Animation triggers
- State management for interactive components

**Behavior Types:**
1. **Navigation** - Go to URL, scroll to element
2. **State Changes** - Toggle visibility, update content
3. **Animations** - Fade, slide, scale, custom
4. **Data Operations** - Form submit, API calls
5. **Custom Scripts** - Advanced users can write custom logic

**Files to Create:**
- `src/app/components/BehaviorEditor.tsx` - Main behavior interface
- `src/app/components/EventTriggerSelector.tsx` - Choose trigger events
- `src/app/components/ActionBuilder.tsx` - Configure actions
- `src/app/components/ConditionBuilder.tsx` - If/else logic
- `src/engine/behaviorEngine.ts` - Runtime behavior execution
- `src/types/behaviors.ts` - Type definitions

**Example Behavior:**
```typescript
{
  id: "behavior-1",
  trigger: "onClick",
  action: "toggle",
  target: "component-123",
  params: {
    property: "visible",
    animation: "fadeIn"
  }
}
```

---

### Phase 6: Layout Analysis & Auto-Layout

**Goal:** Smart positioning and responsive layout suggestions

**Features:**
- Detect layout patterns (header/sidebar/footer, grid, masonry)
- Auto-suggest flexbox/grid layouts based on component arrangement
- Alignment tools (distribute, align, space evenly)
- Responsive breakpoint editor
- Layout templates (dashboard, landing page, form, blog)
- Smart spacing suggestions

**Layout Patterns to Detect:**
1. **App Layout** - Header + Sidebar + Main + Footer
2. **Grid Layout** - Equal-sized cards or items
3. **List Layout** - Vertical or horizontal lists
4. **Hero Section** - Large header with CTA
5. **Form Layout** - Labels and inputs

**Files to Create:**
- `src/utils/layoutAnalyzer.ts` - Pattern detection algorithms
- `src/app/components/LayoutTemplates.tsx` - Pre-built templates
- `src/app/components/AlignmentTools.tsx` - Alignment toolbar
- `src/utils/responsiveEngine.ts` - Breakpoint management

**Alignment Tools:**
- Align left/center/right
- Align top/middle/bottom
- Distribute horizontally/vertically
- Match width/height
- Auto-spacing

---

### Phase 7: Enhanced Layers Panel with Properties Display

**Goal:** Comprehensive layer control with integrated property inspection and management

**Features:**

#### 7.1 Component Hierarchy View
- Visual tree view showing component structure
- Drag-to-reorder within layers panel
- Expand/collapse nested components
- Depth-based indentation
- Component type icons for quick identification
- Component count badges for containers

#### 7.2 Layer Management
- Bring to front / send to back
- Bring forward / send backward
- Lock layers (prevent editing/moving)
- Show/hide layers (visibility toggle)
- Group/ungroup components
- Rename layers with inline editing
- Duplicate components
- Delete components

#### 7.3 Integrated Properties Display
- **Quick Property Preview:** Show key properties for each component in the tree
- **Expandable Property Sections:** Click to expand and see all properties
- **Inline Property Editing:** Edit basic properties directly in the layers panel
- **Property Indicators:** Visual badges showing component state (locked, hidden, has behaviors)

**UI Layout Example:**
```
╔════════════════════════════════════════════════════════╗
║ LAYERS & PROPERTIES                          [⚙] [×]   ║
╠════════════════════════════════════════════════════════╣
║ 🔍 Search components...                                ║
╠════════════════════════════════════════════════════════╣
║ ▼ 📦 Container (Flex Row)                    👁 🔒     ║
║   │ ├─ Properties (expandable)                         ║
║   │ │  • Display: flex                                 ║
║   │ │  • Gap: 16px                                     ║
║   │ │  • Padding: 24px                                 ║
║   │ │  • Background: #ffffff                           ║
║   │ ├─ 🎨 Button "Sign Up"                  👁 [Edit]  ║
║   │ │  └─ bg-blue-600, text-white, px-6 py-2           ║
║   │ └─ 📝 Text "Welcome back"              👁 [Edit]  ║
║   │    └─ text-2xl, font-bold, text-slate-900          ║
║ ▼ 🎴 Card                                    👁 🔒 ⚡   ║
║   │ ├─ Properties                                       ║
║   │ │  • Padding: 32px                                 ║
║   │ │  • Border Radius: 12px                           ║
║   │ │  • Shadow: lg                                    ║
║   │ │  • Behaviors: 1 onClick                          ║
║   │ ├─ 🖼️ Image                             👁 [Edit]  ║
║   │ │  └─ w-full, h-48, rounded-lg                     ║
║   │ └─ 📝 Heading "Product Title"          👁 [Edit]  ║
║       └─ text-xl, font-semibold                        ║
╠════════════════════════════════════════════════════════╣
║ Selected: Button "Sign Up"                            ║
║ ┌────────────────────────────────────────────────┐    ║
║ │ QUICK EDIT                                      │    ║
║ │ Text: [Sign Up____________]                     │    ║
║ │ BG Color: [🎨 #3B82F6]  Text: [🎨 #FFFFFF]     │    ║
║ │ Padding X: [24px▼] Y: [8px▼]                   │    ║
║ │ [Full Properties Editor →]                      │    ║
║ └────────────────────────────────────────────────┘    ║
╚════════════════════════════════════════════════════════╝

Icons Legend:
👁 = Visibility toggle
🔒 = Locked layer
⚡ = Has behaviors
[Edit] = Quick edit button
```

**Property Display Modes:**

1. **Collapsed Mode** (Default)
   - Show component name, type, and icon
   - Show key property as subtitle (e.g., "bg-blue-600, px-4 py-2")
   - Show status icons (locked, hidden, has behaviors)

2. **Expanded Mode** (Click to expand)
   - Show all properties in categorized sections
   - Inline editable fields for quick changes
   - "Edit Full Properties" button to open detailed panel

3. **Selected Mode**
   - Highlight selected component
   - Show quick edit panel at bottom
   - Show full properties in right panel (optional dual-panel mode)

**Properties to Display in Layers Panel:**

For each component type, show most relevant properties:

**Button:**
- Text content
- Background color
- Text color
- Padding
- Border radius
- Behaviors count

**Text/Heading:**
- Text content (truncated)
- Font size
- Font weight
- Color

**Container/Card:**
- Layout type (flex/grid)
- Direction (row/column)
- Gap/spacing
- Padding
- Background
- Number of children

**Image:**
- Source URL (truncated)
- Dimensions
- Border radius
- Object fit

**Input:**
- Placeholder text
- Input type
- Width
- Border style

**Implementation Details:**

**Files to Create:**
- `src/app/components/LayersPanel.tsx` - Main layers panel component
- `src/app/components/LayerItem.tsx` - Individual layer item with properties
- `src/app/components/LayerPropertyPreview.tsx` - Compact property display
- `src/app/components/QuickEditPanel.tsx` - Bottom quick edit section
- `src/app/components/LayerContextMenu.tsx` - Right-click context menu
- `src/utils/propertyFormatter.ts` - Format properties for display
- `src/utils/layerOperations.ts` - Layer reordering, grouping, etc.

**Files to Update:**
- `src/app/App.tsx` - Replace right sidebar with LayersPanel
- `src/app/components/Toolbar.tsx` - Add layer-related toolbar buttons
- `src/types/component.ts` - Add visibility, locked, z-index properties

**Updated ComponentNode Type:**
```typescript
export type ComponentNode = {
  id: string;
  type: string;
  name?: string; // Custom name for the component
  props: Record<string, any>;
  children: ComponentNode[];
  behaviors?: Behavior[];
  layoutConfig?: LayoutConfig;
  parentId?: string | null;
  // New layer properties
  zIndex?: number;
  visible?: boolean; // Show/hide
  locked?: boolean; // Prevent editing
  collapsed?: boolean; // Collapsed in layers panel
  group?: string; // Group ID if part of a group
};
```

**Key Features to Implement:**

1. **Search & Filter:**
   - Search components by name or type
   - Filter by type (buttons, containers, etc.)
   - Filter by state (locked, hidden, has behaviors)

2. **Drag & Drop in Layers:**
   - Reorder components by dragging in layers panel
   - Drag into containers to change parent
   - Visual drop indicators

3. **Quick Actions:**
   - Visibility toggle (eye icon)
   - Lock toggle (lock icon)
   - Duplicate (copy icon)
   - Delete (trash icon)

4. **Context Menu (Right-click):**
   - Rename
   - Duplicate
   - Delete
   - Lock/Unlock
   - Show/Hide
   - Bring to Front
   - Send to Back
   - Group with...
   - Copy properties
   - Paste properties

5. **Multi-Selection:**
   - Ctrl/Cmd+Click to select multiple
   - Shift+Click to select range
   - Bulk operations (delete, group, lock, hide)

6. **Keyboard Shortcuts:**
   - Delete: Remove selected
   - Ctrl+D: Duplicate
   - Ctrl+G: Group
   - Ctrl+L: Lock/Unlock
   - Ctrl+H: Hide/Show
   - ↑↓: Navigate layers
   - Tab: Indent (nest into parent)
   - Shift+Tab: Outdent

**State Management for Layers:**

Add to `builderStore.ts`:
```typescript
interface BuilderState {
  // ... existing state
  selectedComponentIds: string[]; // Support multi-selection
  expandedLayers: Set<string>; // Track which layers are expanded
  layerSearchQuery: string;
  // Actions
  toggleLayerExpanded: (id: string) => void;
  toggleComponentVisibility: (id: string) => void;
  toggleComponentLock: (id: string) => void;
  setSelectedComponents: (ids: string[]) => void;
  moveLayer: (id: string, newParentId: string, index: number) => void;
  groupComponents: (ids: string[]) => void;
  ungroupComponents: (groupId: string) => void;
}
```

**Visual Enhancements:**

1. **Color-Coded Component Types:**
   - Containers: Blue
   - Buttons: Green
   - Text: Gray
   - Images: Purple
   - Inputs: Orange

2. **Property Value Indicators:**
   - Color properties: Show color swatch
   - Size properties: Show visual size indicator
   - Spacing: Show spacing diagram

3. **Hover Effects:**
   - Hover over layer item highlights component on canvas
   - Hover over canvas component highlights layer item

4. **Animations:**
   - Smooth expand/collapse animations
   - Drag and drop animations
   - Property change animations

---

## Recommended Implementation Order

```
Priority 1: Foundation & Core UX
1. Component Tree System (Phase 1)           - Foundation for everything
2. Advanced Canvas with Drop Zones (Phase 2) - Core UX improvement

Priority 2: Essential Editing
3. Properties Panel (Phase 3)                - Must-have for customization

Priority 3: Smart Features
4. Layout Analysis (Phase 6)                 - Smart features & templates
5. Component Stacking (Phase 7)              - Layer management

Priority 4: Advanced Features
6. Custom Component Builder (Phase 4)        - Power user feature
7. Behavior System (Phase 5)                 - Interactivity & logic
```

---

## State Management Strategy

Given the complexity, consider migrating to a dedicated state management solution:

**Recommended: Zustand** (lightweight, TypeScript-friendly)

**Stores to Create:**

### 1. Builder Store (`src/stores/builderStore.ts`)
```typescript
interface BuilderState {
  components: ComponentNode[];
  selectedComponentId: string | null;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  showCode: boolean;
  // Actions
  addComponent: (component: ComponentNode, parentId?: string) => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  removeComponent: (id: string) => void;
  selectComponent: (id: string | null) => void;
  setViewMode: (mode: ViewMode) => void;
}
```

### 2. History Store (`src/stores/historyStore.ts`)
```typescript
interface HistoryState {
  past: ComponentNode[][];
  present: ComponentNode[];
  future: ComponentNode[][];
  // Actions
  undo: () => void;
  redo: () => void;
  addToHistory: (state: ComponentNode[]) => void;
}
```

### 3. Custom Components Store (`src/stores/customComponentsStore.ts`)
```typescript
interface CustomComponentsState {
  customComponents: CustomComponent[];
  // Actions
  addCustomComponent: (component: CustomComponent) => void;
  updateCustomComponent: (id: string, updates: Partial<CustomComponent>) => void;
  removeCustomComponent: (id: string) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}
```

**Benefits:**
- Centralized state management
- Easy undo/redo implementation
- Better performance with selective re-renders
- Easier testing and debugging

---

## Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           App.tsx (Main)                                 │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  Toolbar: View Modes, Undo/Redo, Export, Code, Layer Controls    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│  ┌──────────┬──────────────────────────┬──────────────────────────────┐ │
│  │Component │   Canvas (DropZone)      │  Enhanced Layers Panel       │ │
│  │Library   │   ┌──────────────────┐   │  ┌────────────────────────┐ │ │
│  │          │   │ ComponentRenderer│   │  │ 🔍 Search & Filter     │ │ │
│  │- Premade │   │  (Recursive)     │   │  ├────────────────────────┤ │ │
│  │- Custom  │   │                  │   │  │ 📋 Component Tree      │ │ │
│  │- Draggable│  │  - Drop Zones   │   │  │  ▼ Container           │ │ │
│  │          │   │  - Selection     │   │  │    ├─ Button           │ │ │
│  │          │   │  - Nesting       │   │  │    │  └─ Properties    │ │ │
│  │          │   │  - Hover Effects │   │  │    └─ Text             │ │ │
│  │          │   └──────────────────┘   │  │       └─ Properties    │ │ │
│  │          │                          │  ├────────────────────────┤ │ │
│  │          │                          │  │ ⚡ Quick Edit Panel    │ │ │
│  │          │                          │  │  • Inline Property Edit│ │ │
│  │          │                          │  │  • Color Pickers       │ │ │
│  │          │                          │  │  • Spacing Controls    │ │ │
│  │          │                          │  └────────────────────────┘ │ │
│  └──────────┴──────────────────────────┴──────────────────────────────┘ │
│                                                                          │
│  Optional Toggle: Switch between Layers+Properties or Properties Only   │
└──────────────────────────────────────────────────────────────────────────┘
          │                    │                           │
          ▼                    ▼                           ▼
    builderStore        componentTree             propertyFormatter
    historyStore        layoutAnalyzer            layerOperations
 customComponents       behaviorEngine
```

---

## File Structure Overview

```
src/
├── app/
│   ├── App.tsx (update)
│   └── components/
│       ├── Canvas.tsx (update)
│       ├── ComponentLibrary.tsx (update)
│       ├── Toolbar.tsx (update)
│       │
│       ├── DropZone.tsx (new)
│       ├── ComponentRenderer.tsx (new)
│       │
│       ├── PropertiesPanel.tsx (new)
│       │
│       ├── LayersPanel.tsx (new) ⭐
│       ├── LayerItem.tsx (new) ⭐
│       ├── LayerPropertyPreview.tsx (new) ⭐
│       ├── QuickEditPanel.tsx (new) ⭐
│       ├── LayerContextMenu.tsx (new) ⭐
│       │
│       ├── CustomComponentBuilder.tsx (new)
│       ├── ComponentTemplateModal.tsx (new)
│       ├── BehaviorEditor.tsx (new)
│       ├── LayoutTemplates.tsx (new)
│       ├── AlignmentTools.tsx (new)
│       │
│       └── editors/
│           ├── StyleEditor.tsx (new)
│           ├── LayoutEditor.tsx (new)
│           ├── ContentEditor.tsx (new)
│           ├── PropertyInput.tsx (new)
│           ├── EventTriggerSelector.tsx (new)
│           ├── ActionBuilder.tsx (new)
│           └── ConditionBuilder.tsx (new)
│
├── types/
│   ├── component.ts (new)
│   └── behaviors.ts (new)
│
├── stores/
│   ├── builderStore.ts (new)
│   ├── historyStore.ts (new)
│   └── customComponentsStore.ts (new)
│
├── utils/
│   ├── componentTree.ts (new)
│   ├── componentSerialization.ts (new)
│   ├── layoutAnalyzer.ts (new)
│   ├── responsiveEngine.ts (new)
│   ├── propertyFormatter.ts (new) ⭐
│   └── layerOperations.ts (new) ⭐
│
└── engine/
    └── behaviorEngine.ts (new)

⭐ = Files for Enhanced Layers Panel (Phase 7)
```

---

## Additional Features to Consider

### Code Export Enhancements
- Export to React component files
- Export to HTML/CSS
- Export to different frameworks (Vue, Svelte)
- Copy individual component code
- Export with TypeScript types

### Collaboration Features
- Share designs via URL
- Version history
- Comments and annotations
- Real-time collaboration

### Asset Management
- Image upload and management
- Icon library integration
- Custom font uploads
- Color palette manager

### Advanced Interactions
- Form validation builder
- API integration (fetch data, submit forms)
- State management UI
- Animation timeline editor

### Accessibility
- ARIA attributes editor
- Keyboard navigation support
- Color contrast checker
- Screen reader preview

---

## Code Examples for Enhanced Layers Panel

### Example: LayerItem Component

```typescript
// src/app/components/LayerItem.tsx
import { useState } from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock, Zap } from 'lucide-react';
import { ComponentNode } from '@/types/component';
import { LayerPropertyPreview } from './LayerPropertyPreview';

interface LayerItemProps {
  component: ComponentNode;
  depth: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
}

export function LayerItem({
  component,
  depth,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand,
  onToggleVisibility,
  onToggleLock,
}: LayerItemProps) {
  const [showProperties, setShowProperties] = useState(false);
  const hasChildren = component.children && component.children.length > 0;
  const hasBehaviors = component.behaviors && component.behaviors.length > 0;

  const paddingLeft = `${depth * 16 + 8}px`;

  return (
    <div className="select-none">
      {/* Main Layer Row */}
      <div
        className={`flex items-center gap-2 px-2 py-1.5 hover:bg-slate-100 cursor-pointer border-l-2 ${
          isSelected ? 'bg-blue-50 border-blue-500' : 'border-transparent'
        }`}
        style={{ paddingLeft }}
        onClick={() => onSelect(component.id)}
        onDoubleClick={() => setShowProperties(!showProperties)}
      >
        {/* Expand/Collapse Icon */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) onToggleExpand(component.id);
          }}
          className="w-4 h-4 flex items-center justify-center"
        >
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )
          ) : (
            <span className="w-3" />
          )}
        </button>

        {/* Component Icon & Name */}
        <span className="text-xs">{getComponentIcon(component.type)}</span>
        <span className="text-sm flex-1 truncate">
          {component.name || component.type}
          {hasChildren && <span className="text-xs text-slate-400 ml-1">({component.children.length})</span>}
        </span>

        {/* Status Icons */}
        <div className="flex items-center gap-1">
          {hasBehaviors && <Zap className="w-3 h-3 text-yellow-500" />}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(component.id);
            }}
            className="hover:bg-slate-200 rounded p-0.5"
          >
            {component.visible !== false ? (
              <Eye className="w-3 h-3 text-slate-600" />
            ) : (
              <EyeOff className="w-3 h-3 text-slate-400" />
            )}
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleLock(component.id);
            }}
            className="hover:bg-slate-200 rounded p-0.5"
          >
            {component.locked ? (
              <Lock className="w-3 h-3 text-red-500" />
            ) : (
              <Unlock className="w-3 h-3 text-slate-400" />
            )}
          </button>
        </div>
      </div>

      {/* Property Preview (Expandable) */}
      {showProperties && (
        <LayerPropertyPreview component={component} depth={depth} />
      )}

      {/* Render Children */}
      {isExpanded && hasChildren && (
        <div>
          {component.children.map((child) => (
            <LayerItem
              key={child.id}
              component={child}
              depth={depth + 1}
              isSelected={false}
              isExpanded={false}
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
              onToggleVisibility={onToggleVisibility}
              onToggleLock={onToggleLock}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function getComponentIcon(type: string): string {
  const icons: Record<string, string> = {
    Button: '🎨',
    Input: '📝',
    Text: '📄',
    Heading: '📰',
    Container: '📦',
    Card: '🎴',
    Image: '🖼️',
  };
  return icons[type] || '🔷';
}
```

### Example: LayerPropertyPreview Component

```typescript
// src/app/components/LayerPropertyPreview.tsx
import { ComponentNode } from '@/types/component';
import { formatProperty } from '@/utils/propertyFormatter';

interface LayerPropertyPreviewProps {
  component: ComponentNode;
  depth: number;
}

export function LayerPropertyPreview({ component, depth }: LayerPropertyPreviewProps) {
  const paddingLeft = `${(depth + 1) * 16 + 24}px`;

  const keyProperties = getKeyProperties(component);

  return (
    <div
      className="bg-slate-50 border-l-2 border-slate-200 py-1"
      style={{ paddingLeft }}
    >
      <div className="text-xs text-slate-600 space-y-0.5">
        {keyProperties.map((prop, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-slate-500">•</span>
            <span className="font-medium">{prop.label}:</span>
            <span className="text-slate-700">{formatProperty(prop.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function getKeyProperties(component: ComponentNode) {
  const props = component.props;
  const properties: Array<{ label: string; value: any }> = [];

  // Common properties for all components
  if (props.className) {
    properties.push({ label: 'Classes', value: props.className });
  }

  // Type-specific properties
  switch (component.type) {
    case 'Button':
      if (component.children) properties.push({ label: 'Text', value: component.children });
      break;
    case 'Text':
    case 'Heading':
      if (component.children) properties.push({ label: 'Content', value: component.children });
      break;
    case 'Input':
      if (props.placeholder) properties.push({ label: 'Placeholder', value: props.placeholder });
      if (props.type) properties.push({ label: 'Type', value: props.type });
      break;
    case 'Container':
      if (component.layoutConfig) {
        properties.push({ label: 'Display', value: component.layoutConfig.flexDirection || 'block' });
        if (component.layoutConfig.gap) properties.push({ label: 'Gap', value: component.layoutConfig.gap });
      }
      break;
    case 'Image':
      if (props.src) properties.push({ label: 'Source', value: props.src });
      break;
  }

  return properties.slice(0, 4); // Limit to 4 key properties
}
```

### Example: Property Formatter Utility

```typescript
// src/utils/propertyFormatter.ts

export function formatProperty(value: any): string {
  if (typeof value === 'string') {
    // Truncate long strings
    if (value.length > 40) {
      return value.substring(0, 40) + '...';
    }
    return value;
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  if (Array.isArray(value)) {
    return `[${value.length} items]`;
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  return String(value);
}

export function extractClassProperties(className: string) {
  const properties = {
    colors: [] as string[],
    spacing: [] as string[],
    sizing: [] as string[],
    layout: [] as string[],
  };

  const classes = className.split(' ');

  classes.forEach((cls) => {
    if (cls.match(/^(bg|text|border)-/)) {
      properties.colors.push(cls);
    } else if (cls.match(/^(p|m|gap|space)-/)) {
      properties.spacing.push(cls);
    } else if (cls.match(/^(w|h|max-w|max-h|min-w|min-h)-/)) {
      properties.sizing.push(cls);
    } else if (cls.match(/^(flex|grid|block|inline|hidden)/)) {
      properties.layout.push(cls);
    }
  });

  return properties;
}
```

---

## Next Steps

Choose one of the following to begin implementation:

1. **Start with Phase 1** - Implement the component tree system and refactor existing code
2. **Create the full type definitions** - Generate all TypeScript interfaces/types first
3. **Set up state management** - Implement Zustand stores for the builder
4. **Build Enhanced Layers Panel (Phase 7)** - Start with the layers panel with property display
5. **Build a specific feature** - Focus on one particular phase (e.g., Properties Panel)
6. **Create a detailed technical spec** - More granular implementation details for a specific phase

---

## Resources & References

- **react-dnd Documentation**: https://react-dnd.github.io/react-dnd/
- **Radix UI**: https://www.radix-ui.com/
- **shadcn/ui**: https://ui.shadcn.com/
- **Tailwind CSS**: https://tailwindcss.com/
- **Zustand**: https://zustand-demo.pmnd.rs/

---

**Document Version:** 1.1
**Last Updated:** 2026-02-11
**Status:** Planning Phase
**Latest Update:** Enhanced Phase 7 with integrated layers panel and property display
