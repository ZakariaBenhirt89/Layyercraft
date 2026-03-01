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
  Layers,
  Eye,
  X,
} from 'lucide-react';
import { useBuilderStore } from '../stores/builderStore';

export default function App() {
  const {
    components,
    viewMode,
    showCode,
    selectedComponentId,
    rightPanelMode,
    setViewMode,
    setShowCode,
    setRightPanelMode,
    setSelectedComponent,
    addComponent,
    removeComponent,
    clearCanvas,
    updateComponent,
    applyAIComponents,
    applyAIModifications,
    getSelectedComponent,
  } = useBuilderStore();

  const selectedComponent = getSelectedComponent();
  const [showLibrary, setShowLibrary] = useState(false);
  const [showInspector, setShowInspector] = useState(false);

  const openLibrary = () => { setShowLibrary(true); setShowInspector(false); };
  const openInspector = () => { setShowInspector(true); setShowLibrary(false); };
  const closeAll = () => { setShowLibrary(false); setShowInspector(false); };

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
        <div className="flex-1 flex overflow-hidden relative">

          {/* Mobile backdrop */}
          {(showLibrary || showInspector) && (
            <div
              className="md:hidden absolute inset-0 bg-black/40 z-30 backdrop-blur-[1px]"
              onClick={closeAll}
            />
          )}

          {/* Left Sidebar - Component Library */}
          <aside
            className={`
              absolute inset-y-0 left-0 z-40
              md:relative md:z-auto md:translate-x-0
              w-80 min-w-[320px]
              bg-white dark:bg-slate-950
              border-r border-slate-200 dark:border-slate-800
              overflow-y-auto
              transition-transform duration-200 ease-out
              ${showLibrary ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
            `}
          >
            <div className="p-4 border-b border-slate-200 bg-slate-50 dark:bg-slate-900 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg">Components</h2>
                </div>
                <button
                  onClick={closeAll}
                  className="md:hidden p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1 dark:text-slate-400">
                Drag components to the canvas
              </p>
            </div>
            <ComponentLibrary />
          </aside>

          {/* Center - Canvas Area */}
          <main className="flex-1 overflow-auto bg-slate-100 p-4 md:p-8 dark:bg-slate-900">
            <Canvas
              components={components}
              removeComponent={removeComponent}
              addComponent={addComponent}
              selectedComponentId={selectedComponentId}
              selectComponent={setSelectedComponent}
              viewMode={viewMode}
              showCode={showCode}
            />
          </main>

          {/* Right Sidebar - Layers/Properties/AI */}
          <aside
            className={`
              absolute inset-y-0 right-0 z-40
              md:relative md:z-auto md:translate-x-0
              w-72 min-w-[288px]
              bg-white dark:bg-slate-950
              border-l border-slate-200 dark:border-slate-800
              overflow-y-auto
              transition-transform duration-200 ease-out
              ${showInspector ? 'translate-x-0 shadow-2xl' : 'translate-x-full'}
            `}
          >
            <div className="border-b border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <Eye className="w-5 h-5 text-blue-600 shrink-0" />
                  <h2 className="text-lg truncate">{rightPanelMode === 'ai' ? 'AI' : 'Layers'}</h2>
                </div>
                <div className="flex items-center gap-1 shrink-0">
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
                  <button
                    onClick={closeAll}
                    className="md:hidden p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500"
                  >
                    <X className="w-4 h-4" />
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

          {/* Mobile floating toggle pill */}
          <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 bg-white dark:bg-slate-900 rounded-full px-2 py-1.5 shadow-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => showLibrary ? closeAll() : openLibrary()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showLibrary
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Library
            </button>
            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={() => showInspector ? closeAll() : openInspector()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                showInspector
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Inspector
            </button>
          </div>
        </div>
      </div>
    </DndProvider>
  );
}
