import { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { ComponentLibrary } from './components/ComponentLibrary';
import { Canvas } from './components/Canvas';
import { Toolbar } from './components/Toolbar';
import { PropertiesPanel } from './components/PropertiesPanel';
import { AIChatPanel } from './components/AIChatPanel';
import type { ComponentNode } from '../types/component';
import {
  addComponent as addNode,
  removeComponent as removeNode,
  updateComponent as updateNode,
  findComponent,
  mergeComponentUpdates,
} from '../utils/componentTree';
import { isContainerType } from '../utils/componentTypes';
import { 
  Layers, 
  Eye
} from 'lucide-react';

export type ViewMode = 'desktop' | 'tablet' | 'mobile';

export default function App() {
  const [components, setComponents] = useState<ComponentNode[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [showCode, setShowCode] = useState(false);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [rightPanelMode, setRightPanelMode] = useState<'inspector' | 'ai'>('inspector');

  const addComponent = (component: Omit<ComponentNode, 'id' | 'children'>, parentId?: string) => {
    const newComponent: ComponentNode = {
      ...component,
      id: `component-${Date.now()}-${Math.random()}`,
      children: [],
      parentId: parentId ?? null,
    };
    setComponents((prev) => addNode(prev, newComponent, parentId));
  };

  const removeComponent = (id: string) => {
    setComponents((prev) => removeNode(prev, id));
    if (selectedComponentId === id) {
      setSelectedComponentId(null);
    }
  };

  const clearCanvas = () => {
    setComponents([]);
    setSelectedComponentId(null);
  };

  const updateComponent = (id: string, updates: Partial<ComponentNode>) => {
    setComponents((prev) => updateNode(prev, id, updates));
  };

  const selectedComponent = selectedComponentId
    ? findComponent(components, selectedComponentId)
    : null;

  const applyAIComponents = (nodes: ComponentNode[]) => {
    const parentId = selectedComponentId
      ? isContainerType(selectedComponent?.type ?? '')
        ? selectedComponentId
        : selectedComponent?.parentId ?? null
      : null;

    setComponents((prev) => {
      let next = prev;
      nodes.forEach((node) => {
        const component = { ...node, parentId } as ComponentNode;
        next = addNode(next, component, parentId ?? undefined);
      });
      return next;
    });

    if (nodes[0]) {
      setSelectedComponentId(nodes[0].id);
    }
  };

  const applyAIModifications = (mods: { componentId: string; updates: Partial<ComponentNode> }[]) => {
    setComponents((prev) => {
      let next = prev;
      mods.forEach((mod) => {
        next = mergeComponentUpdates(next, mod.componentId, mod.updates);
      });
      return next;
    });
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        {/* Top Toolbar */}
        <Toolbar 
          viewMode={viewMode}
          setViewMode={setViewMode}
          showCode={showCode}
          setShowCode={setShowCode}
          clearCanvas={clearCanvas}
          rightPanelMode={rightPanelMode}
          setRightPanelMode={setRightPanelMode}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar - Component Library */}
          <aside className="w-80 bg-white border-r border-slate-200 overflow-y-auto dark:bg-slate-950 dark:border-slate-800">
            <div className="p-4 border-b border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg">Components</h2>
              </div>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Drag components to the canvas
              </p>
            </div>
            <ComponentLibrary />
          </aside>

          {/* Center - Canvas Area */}
          <main className="flex-1 overflow-auto bg-slate-100 p-8 dark:bg-slate-900">
            <Canvas 
              components={components}
              removeComponent={removeComponent}
              addComponent={addComponent}
              selectedComponentId={selectedComponentId}
              selectComponent={setSelectedComponentId}
              viewMode={viewMode}
              showCode={showCode}
            />
          </main>

          {/* Right Sidebar - Layers/Properties/AI */}
          <aside className="w-72 bg-white border-l border-slate-200 overflow-y-auto dark:bg-slate-950 dark:border-slate-800">
            <div className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg">{rightPanelMode === 'ai' ? 'AI' : 'Layers'}</h2>
                </div>
                <div className="flex items-center gap-1 rounded-lg bg-white p-1 text-xs text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-300">
                  <button
                    onClick={() => setRightPanelMode('inspector')}
                    className={`rounded-md px-2 py-1 ${
                      rightPanelMode === 'inspector'
                        ? 'bg-blue-600 text-white'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Inspector
                  </button>
                  <button
                    onClick={() => setRightPanelMode('ai')}
                    className={`rounded-md px-2 py-1 ${
                      rightPanelMode === 'ai'
                        ? 'bg-blue-600 text-white'
                        : 'hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    AI
                  </button>
                </div>
              </div>
            </div>

            {rightPanelMode === 'ai' ? (
              <AIChatPanel
                components={components}
                selectedComponent={selectedComponent}
                viewMode={viewMode}
                onApplyCreate={applyAIComponents}
                onApplyModify={applyAIModifications}
              />
            ) : (
              <>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                  {components.length === 0 ? (
                    <p className="text-sm text-slate-500 text-center py-8 dark:text-slate-400">
                      No components yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {components.map((comp, index) => {
                        const renderLayer = (node: ComponentNode, depth: number, position: number) => (
                          <div key={node.id} className="space-y-2">
                            <button
                              onClick={() => setSelectedComponentId(node.id)}
                              className={`w-full flex items-center justify-between p-2 rounded-lg border text-left transition-colors ${
                                selectedComponentId === node.id
                                  ? 'border-blue-400 bg-blue-50 dark:bg-blue-950/40'
                                  : 'border-slate-200 bg-slate-50 hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-400'
                              }`}
                            >
                              <span className="text-sm text-slate-700 dark:text-slate-200">
                                {'—'.repeat(depth)} {node.type} {position + 1}
                              </span>
                              <span className="text-xs text-slate-400 dark:text-slate-500">
                                {node.children.length ? `${node.children.length}` : ''}
                              </span>
                            </button>
                            {node.children.length ? (
                              <div className="space-y-2 pl-3">
                                {node.children.map((child, childIndex) =>
                                  renderLayer(child, depth + 1, childIndex)
                                )}
                              </div>
                            ) : null}
                          </div>
                        );

                        return renderLayer(comp, 0, index);
                      })}
                    </div>
                  )}
                </div>
                <PropertiesPanel
                  component={selectedComponent}
                  onUpdate={updateComponent}
                />
              </>
            )}
          </aside>
        </div>
      </div>
    </DndProvider>
  );
}
