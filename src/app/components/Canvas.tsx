import type { ComponentNode } from '../../types/component';
import type { ViewMode } from '../App';
import { DropZone } from './DropZone';
import { ComponentRenderer } from './ComponentRenderer';

type CanvasProps = {
  components: ComponentNode[];
  removeComponent: (id: string) => void;
  addComponent: (component: Omit<ComponentNode, 'id' | 'children'>, parentId?: string) => void;
  selectedComponentId: string | null;
  selectComponent: (id: string | null) => void;
  viewMode: ViewMode;
  showCode: boolean;
};

export function Canvas({
  components,
  removeComponent,
  addComponent,
  selectedComponentId,
  selectComponent,
  viewMode,
  showCode,
}: CanvasProps) {
  const getCanvasWidth = () => {
    switch (viewMode) {
      case 'mobile':
        return 'max-w-sm';
      case 'tablet':
        return 'max-w-2xl';
      case 'desktop':
      default:
        return 'max-w-6xl';
    }
  };

  const generateCode = () => {
    const renderNode = (node: ComponentNode, depth: number) => {
      const indent = '  '.repeat(depth);
      const content = node.props.content ?? '';

      switch (node.type) {
        case 'Button':
          return `${indent}<button className="${node.props.className}">${content}</button>`;
        case 'Input':
          return `${indent}<input type="${node.props.type || 'text'}" placeholder="${node.props.placeholder}" className="${node.props.className}" />`;
        case 'Text':
          return `${indent}<p className="${node.props.className}">${content}</p>`;
        case 'Heading':
          return `${indent}<h2 className="${node.props.className}">${content}</h2>`;
        case 'Image':
          return `${indent}<img src="${node.props.src}" alt="${node.props.alt}" className="${node.props.className}" />`;
        case 'Card':
        case 'Container': {
          const childContent = node.children.map((child) => renderNode(child, depth + 1)).join('\n');
          const inner = childContent ? `\n${childContent}\n${indent}` : `\n${indent}  {/* Container content */}\n${indent}`;
          return `${indent}<div className="${node.props.className}">${inner}</div>`;
        }
        default:
          return '';
      }
    };

    return components.map((comp) => renderNode(comp, 0)).join('\n\n');
  };

  if (showCode) {
    return (
      <div className={`mx-auto ${getCanvasWidth()} bg-slate-900 rounded-xl shadow-2xl p-6 min-h-[600px]`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-400">Generated Code</span>
          <button
            onClick={() => {
              const code = generateCode();
              const textarea = document.createElement('textarea');
              textarea.value = code;
              textarea.style.position = 'fixed';
              textarea.style.opacity = '0';
              document.body.appendChild(textarea);
              textarea.select();
              try {
                document.execCommand('copy');
              } catch (err) {
                console.error('Failed to copy:', err);
              } finally {
                document.body.removeChild(textarea);
              }
            }}
            className="text-xs px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Copy Code
          </button>
        </div>
        <pre className="text-sm text-green-400 font-mono overflow-auto">
          <code>{generateCode() || '// No components yet'}</code>
        </pre>
      </div>
    );
  }

  return (
    <DropZone
      onDrop={(item) => {
        addComponent({
          type: item.type,
          props: {
            ...item.props,
            content: item.children ?? item.props?.content,
          },
        });
      }}
      className={`mx-auto ${getCanvasWidth()} bg-white rounded-xl shadow-2xl p-8 min-h-[600px] transition-all`}
    >
      {components.length === 0 ? (
        <div className="flex items-center justify-center h-full min-h-[500px]">
          <div className="text-center">
            <div className="inline-block p-4 bg-slate-100 rounded-full mb-4">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                />
              </svg>
            </div>
            <h3 className="text-xl text-slate-700 mb-2">Start Building</h3>
            <p className="text-slate-500">
              Drag and drop components from the left sidebar to get started
            </p>
          </div>
        </div>
      ) : (
        <ComponentRenderer
          components={components}
          removeComponent={removeComponent}
          addComponent={addComponent}
          selectedComponentId={selectedComponentId}
          selectComponent={selectComponent}
        />
      )}
    </DropZone>
  );
}
