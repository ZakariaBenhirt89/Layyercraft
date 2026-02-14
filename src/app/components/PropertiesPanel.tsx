import type { ComponentNode } from '../../types/component';

type PropertiesPanelProps = {
  component: ComponentNode | null;
  onUpdate: (id: string, updates: Partial<ComponentNode>) => void;
};

export function PropertiesPanel({ component, onUpdate }: PropertiesPanelProps) {
  if (!component) {
    return (
      <div className="p-4">
        <h3 className="text-sm text-slate-600 mb-2">Properties</h3>
        <p className="text-xs text-slate-500">Select a component to edit its properties.</p>
      </div>
    );
  }

  const updateProps = (updates: Record<string, any>) => {
    onUpdate(component.id, {
      props: {
        ...component.props,
        ...updates,
      },
    });
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="text-sm text-slate-600">Properties</h3>
        <p className="text-xs text-slate-400">{component.type}</p>
      </div>

      <label className="block text-xs text-slate-500">
        Class Name
        <input
          className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
          value={component.props.className ?? ''}
          onChange={(event) => updateProps({ className: event.target.value })}
          placeholder="Tailwind classes"
        />
      </label>

      {['Button', 'Heading', 'Text', 'Card', 'Container'].includes(component.type) ? (
        <label className="block text-xs text-slate-500">
          Content
          <input
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
            value={component.props.content ?? ''}
            onChange={(event) => updateProps({ content: event.target.value })}
            placeholder="Text content"
          />
        </label>
      ) : null}

      {component.type === 'Input' ? (
        <>
          <label className="block text-xs text-slate-500">
            Placeholder
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
              value={component.props.placeholder ?? ''}
              onChange={(event) => updateProps({ placeholder: event.target.value })}
            />
          </label>
          <label className="block text-xs text-slate-500">
            Type
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
              value={component.props.type ?? 'text'}
              onChange={(event) => updateProps({ type: event.target.value })}
            />
          </label>
        </>
      ) : null}

      {component.type === 'Image' ? (
        <>
          <label className="block text-xs text-slate-500">
            Source URL
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
              value={component.props.src ?? ''}
              onChange={(event) => updateProps({ src: event.target.value })}
            />
          </label>
          <label className="block text-xs text-slate-500">
            Alt Text
            <input
              className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1 text-sm"
              value={component.props.alt ?? ''}
              onChange={(event) => updateProps({ alt: event.target.value })}
            />
          </label>
        </>
      ) : null}
    </div>
  );
}
