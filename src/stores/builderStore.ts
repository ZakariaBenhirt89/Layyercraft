import { create } from 'zustand';
import type { ComponentNode } from '../types/component';
import {
  addComponent as addNode,
  removeComponent as removeNode,
  updateComponent as updateNode,
  mergeComponentUpdates,
  findComponent,
} from '../utils/componentTree';
import { isContainerType } from '../utils/componentTypes';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

type RightPanelMode = 'inspector' | 'ai';

export type AIModification = {
  componentId: string;
  updates: Partial<ComponentNode>;
};

type BuilderState = {
  components: ComponentNode[];
  viewMode: ViewMode;
  showCode: boolean;
  selectedComponentId: string | null;
  rightPanelMode: RightPanelMode;
  // selectors
  getSelectedComponent: () => ComponentNode | null;
  // actions
  setViewMode: (mode: ViewMode) => void;
  setShowCode: (show: boolean) => void;
  setRightPanelMode: (mode: RightPanelMode) => void;
  setSelectedComponent: (id: string | null) => void;
  addComponent: (component: Omit<ComponentNode, 'id' | 'children'>, parentId?: string) => void;
  removeComponent: (id: string) => void;
  clearCanvas: () => void;
  updateComponent: (id: string, updates: Partial<ComponentNode>) => void;
  applyAIComponents: (nodes: ComponentNode[]) => void;
  applyAIModifications: (mods: AIModification[]) => void;
};

export const useBuilderStore = create<BuilderState>((set, get) => ({
  components: [],
  viewMode: 'desktop',
  showCode: false,
  selectedComponentId: null,
  rightPanelMode: 'inspector',

  getSelectedComponent: () => {
    const { components, selectedComponentId } = get();
    if (!selectedComponentId) return null;
    return findComponent(components, selectedComponentId);
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  setShowCode: (show) => set({ showCode: show }),

  setRightPanelMode: (mode) => set({ rightPanelMode: mode }),

  setSelectedComponent: (id) => set({ selectedComponentId: id }),

  addComponent: (component, parentId) => {
    const newComponent: ComponentNode = {
      ...component,
      id: `component-${Date.now()}-${Math.random()}`,
      children: [],
      parentId: parentId ?? null,
    };
    set((state) => ({
      components: addNode(state.components, newComponent, parentId),
      selectedComponentId: newComponent.id,
    }));
  },

  removeComponent: (id) => {
    set((state) => {
      const nextComponents = removeNode(state.components, id);
      const nextSelected = state.selectedComponentId === id ? null : state.selectedComponentId;
      return {
        components: nextComponents,
        selectedComponentId: nextSelected,
      };
    });
  },

  clearCanvas: () =>
    set({
      components: [],
      selectedComponentId: null,
    }),

  updateComponent: (id, updates) =>
    set((state) => ({
      components: updateNode(state.components, id, updates),
    })),

  applyAIComponents: (nodes) => {
    set((state) => {
      const { selectedComponentId, components } = state;
      const selected = selectedComponentId ? findComponent(components, selectedComponentId) : null;

      const parentId = selectedComponentId
        ? isContainerType(selected?.type ?? '')
          ? selectedComponentId
          : selected?.parentId ?? null
        : null;

      let next = components;
      nodes.forEach((node) => {
        const component: ComponentNode = {
          ...node,
          parentId,
        };
        next = addNode(next, component, parentId ?? undefined);
      });

      const firstId = nodes[0]?.id ?? null;

      return {
        components: next,
        selectedComponentId: firstId,
      };
    });
  },

  applyAIModifications: (mods) =>
    set((state) => {
      let next = state.components;
      mods.forEach((mod) => {
        next = mergeComponentUpdates(next, mod.componentId, mod.updates);
      });
      return { components: next };
    }),
}));

