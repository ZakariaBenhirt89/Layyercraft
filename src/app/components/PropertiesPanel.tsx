import type { ComponentNode } from '../../types/component';

type PropertiesPanelProps = {
  component: ComponentNode | null;
  onUpdate: (id: string, updates: Partial<ComponentNode>) => void;
};

export function PropertiesPanel({ component, onUpdate }: PropertiesPanelProps) {
  if (!component) {
    return (
      <div className="p-4">
        <h3 className="text-sm text-slate-600 mb-2 dark:text-slate-300">Properties</h3>
        <p className="text-xs text-slate-500 dark:text-slate-500">Select a component to edit its properties.</p>
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
        <h3 className="text-sm text-slate-600 dark:text-slate-300">Properties</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500">{component.type}</p>
      </div>

      <label className="block text-xs text-slate-500 dark:text-slate-400">
        Class Name
        <input
          className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
          value={component.props.className ?? ''}
          onChange={(event) => updateProps({ className: event.target.value })}
          placeholder="Tailwind classes"
        />
      </label>

      {['Button', 'Heading', 'Text', 'Card', 'Container'].includes(component.type) ? (
        <label className="block text-xs text-slate-500 dark:text-slate-400">
          Content
          <input
            className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
            value={component.props.content ?? ''}
            onChange={(event) => updateProps({ content: event.target.value })}
            placeholder="Text content"
          />
        </label>
      ) : null}

      {component.type === 'Input' ? (
        <>
          <label className="block text-xs text-slate-500 dark:text-slate-400">
            Placeholder
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={component.props.placeholder ?? ''}
              onChange={(event) => updateProps({ placeholder: event.target.value })}
            />
          </label>
          <label className="block text-xs text-slate-500 dark:text-slate-400">
            Type
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={component.props.type ?? 'text'}
              onChange={(event) => updateProps({ type: event.target.value })}
            />
          </label>
        </>
      ) : null}

      {component.type === 'Image' ? (
        <>
          <label className="block text-xs text-slate-500 dark:text-slate-400">
            Source URL
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={component.props.src ?? ''}
              onChange={(event) => updateProps({ src: event.target.value })}
            />
          </label>
          <label className="block text-xs text-slate-500 dark:text-slate-400">
            Alt Text
            <input
              className="mt-1 w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              value={component.props.alt ?? ''}
              onChange={(event) => updateProps({ alt: event.target.value })}
            />
          </label>
        </>
      ) : null}
    </div>
  );
}
