import { Trash2 } from 'lucide-react';
import type { ComponentNode } from '../../types/component';
import { DropZone } from './DropZone';
import { isContainerType } from '../../utils/componentTypes';

type ComponentRendererProps = {
  components: ComponentNode[];
  removeComponent: (id: string) => void;
  addComponent: (component: Omit<ComponentNode, 'id' | 'children'>, parentId?: string) => void;
  selectedComponentId: string | null;
  selectComponent: (id: string) => void;
};

type DragItem = { type: string; props: Record<string, any>; children?: string };

const normalizeDragItem = (item: DragItem) => ({
  type: item.type,
  props: {
    ...item.props,
    content: item.children ?? item.props?.content,
  },
});

const renderLeaf = (
  node: ComponentNode,
  onRemove: (id: string) => void,
  onSelect: (id: string) => void,
  selected: boolean
) => {
  const { type, props, id } = node;
  const content = props.content ?? '';
  const ring = selected ? 'ring-2 ring-blue-400 ring-opacity-70' : '';

  switch (type) {
    case 'Button':
      return (
        <div
          key={id}
          className={`relative group inline-block ${ring}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <button className={`${props.className} pointer-events-none`} style={props.style}>
            {content}
          </button>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRemove(id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    case 'Input':
      return (
        <div
          key={id}
          className={`relative group ${ring}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <input
            type={props.type || 'text'}
            placeholder={props.placeholder}
            className={`${props.className} pointer-events-none`}
            style={props.style}
          />
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRemove(id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    case 'Text':
      return (
        <div
          key={id}
          className={`relative group inline-block ${ring}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <p className={`${props.className} pointer-events-none`} style={props.style}>
            {content}
          </p>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRemove(id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    case 'Heading':
      return (
        <div
          key={id}
          className={`relative group inline-block ${ring}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <h2 className={`${props.className} pointer-events-none`} style={props.style}>
            {content}
          </h2>
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRemove(id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    case 'Image':
      return (
        <div
          key={id}
          className={`relative group inline-block ${ring}`}
          onClick={(event) => {
            event.stopPropagation();
            onSelect(id);
          }}
        >
          <img
            src={props.src}
            alt={props.alt}
            className={`${props.className} pointer-events-none`}
            style={props.style}
          />
          <button
            onClick={(event) => {
              event.stopPropagation();
              onRemove(id);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      );
    default:
      return null;
  }
};

const renderContainer = (
  node: ComponentNode,
  onRemove: (id: string) => void,
  onSelect: (id: string) => void,
  onDrop: (item: DragItem, parentId?: string) => void,
  children: React.ReactNode,
  selected: boolean
) => {
  const { props, id } = node;
  const placeholder = props.content ?? 'Drop content here';
  const ring = selected ? 'ring-2 ring-blue-400 ring-opacity-70' : '';

  return (
    <div
      key={id}
      className={`relative group ${ring}`}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(id);
      }}
    >
      <DropZone
        parentId={id}
        onDrop={onDrop}
        className={`${props.className} min-h-[80px]`}
      >
        {children}
        {!node.children.length ? (
          <p className="text-slate-400 text-sm pointer-events-none dark:text-slate-500">{placeholder}</p>
        ) : null}
      </DropZone>
      <button
        onClick={(event) => {
          event.stopPropagation();
          onRemove(id);
        }}
        className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

export function ComponentRenderer({
  components,
  removeComponent,
  addComponent,
  selectedComponentId,
  selectComponent,
}: ComponentRendererProps) {
  const handleDrop = (item: DragItem, parentId?: string) => {
    const normalized = normalizeDragItem(item);
    addComponent(
      {
        type: normalized.type,
        props: normalized.props,
      },
      parentId
    );
  };

  const renderNode = (node: ComponentNode) => {
    const selected = selectedComponentId === node.id;
    if (isContainerType(node.type)) {
      return renderContainer(
        node,
        removeComponent,
        selectComponent,
        handleDrop,
        <div className="space-y-4">
          {node.children.map((child) => renderNode(child))}
        </div>,
        selected
      );
    }
    return renderLeaf(node, removeComponent, selectComponent, selected);
  };

  return <div className="space-y-4">{components.map((component) => renderNode(component))}</div>;
}
