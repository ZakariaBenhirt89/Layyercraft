import { useDrag } from 'react-dnd';
import {
  Square,
  Type,
  Heading1,
  Image as ImageIcon,
  MousePointer,
  CreditCard,
  LayoutGrid,
} from 'lucide-react';

type DraggableComponentProps = {
  type: string;
  icon: React.ReactNode;
  label: string;
  preview: React.ReactNode;
  props: Record<string, any>;
  children?: string;
};

function DraggableComponent({ type, icon, label, preview, props, children }: DraggableComponentProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'component',
    item: { type, props, children },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`cursor-move bg-white border-2 border-slate-200 rounded-lg p-4 hover:border-blue-400 hover:shadow-md transition-all dark:bg-slate-950 dark:border-slate-800 ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
          {icon}
        </div>
        <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
      </div>
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        {preview}
      </div>
    </div>
  );
}

export function ComponentLibrary() {
  const components = [
    {
      type: 'Button',
      icon: <MousePointer className="w-4 h-4" />,
      label: 'Primary Button',
      props: {
        className: 'px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors',
      },
      children: 'Click me',
      preview: (
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
          Click me
        </button>
      ),
    },
    {
      type: 'Button',
      icon: <MousePointer className="w-4 h-4" />,
      label: 'Secondary Button',
      props: {
        className: 'px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors',
      },
      children: 'Click me',
      preview: (
        <button className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm">
          Click me
        </button>
      ),
    },
    {
      type: 'Button',
      icon: <MousePointer className="w-4 h-4" />,
      label: 'Outline Button',
      props: {
        className: 'px-6 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors',
      },
      children: 'Click me',
      preview: (
        <button className="px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg text-sm">
          Click me
        </button>
      ),
    },
    {
      type: 'Input',
      icon: <Type className="w-4 h-4" />,
      label: 'Text Input',
      props: {
        type: 'text',
        placeholder: 'Enter text...',
        className: 'w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none',
      },
      preview: (
        <input
          type="text"
          placeholder="Enter text..."
          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm"
        />
      ),
    },
    {
      type: 'Input',
      icon: <Type className="w-4 h-4" />,
      label: 'Email Input',
      props: {
        type: 'email',
        placeholder: 'your@email.com',
        className: 'w-full px-4 py-2 border-2 border-slate-200 rounded-lg focus:border-blue-500 focus:outline-none',
      },
      preview: (
        <input
          type="email"
          placeholder="your@email.com"
          className="w-full px-3 py-2 border-2 border-slate-200 rounded-lg text-sm"
        />
      ),
    },
    {
      type: 'Heading',
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Large Heading',
      props: {
        className: 'text-4xl text-slate-900',
      },
      children: 'Welcome to our site',
      preview: (
        <h2 className="text-2xl text-slate-900">Welcome to our site</h2>
      ),
    },
    {
      type: 'Heading',
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Medium Heading',
      props: {
        className: 'text-2xl text-slate-800',
      },
      children: 'Section Title',
      preview: (
        <h2 className="text-lg text-slate-800">Section Title</h2>
      ),
    },
    {
      type: 'Text',
      icon: <Type className="w-4 h-4" />,
      label: 'Paragraph',
      props: {
        className: 'text-slate-600 leading-relaxed',
      },
      children: 'This is a paragraph of text. You can add your content here.',
      preview: (
        <p className="text-sm text-slate-600">
          This is a paragraph of text. You can add your content here.
        </p>
      ),
    },
    {
      type: 'Card',
      icon: <CreditCard className="w-4 h-4" />,
      label: 'Card',
      props: {
        className: 'p-6 bg-white border-2 border-slate-200 rounded-xl shadow-sm',
      },
      children: 'Card content goes here',
      preview: (
        <div className="p-4 bg-white border-2 border-slate-200 rounded-lg">
          <p className="text-xs text-slate-500">Card content goes here</p>
        </div>
      ),
    },
    {
      type: 'Card',
      icon: <CreditCard className="w-4 h-4" />,
      label: 'Featured Card',
      props: {
        className: 'p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg',
      },
      children: 'Featured content',
      preview: (
        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg">
          <p className="text-xs">Featured content</p>
        </div>
      ),
    },
    {
      type: 'Container',
      icon: <Square className="w-4 h-4" />,
      label: 'Container',
      props: {
        className: 'p-8 border-2 border-dashed border-slate-300 rounded-xl',
      },
      children: 'Container - Drop content here',
      preview: (
        <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg">
          <p className="text-xs text-slate-400 text-center">Container</p>
        </div>
      ),
    },
    {
      type: 'Container',
      icon: <LayoutGrid className="w-4 h-4" />,
      label: 'Flex Container',
      props: {
        className: 'flex gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl',
      },
      children: 'Flex Container',
      preview: (
        <div className="flex gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg">
          <div className="flex-1 h-8 bg-slate-200 rounded"></div>
          <div className="flex-1 h-8 bg-slate-200 rounded"></div>
        </div>
      ),
    },
    {
      type: 'Image',
      icon: <ImageIcon className="w-4 h-4" />,
      label: 'Image',
      props: {
        src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=300&fit=crop',
        alt: 'Placeholder image',
        className: 'w-full h-48 object-cover rounded-lg',
      },
      preview: (
        <div className="w-full h-24 bg-slate-200 rounded-lg flex items-center justify-center">
          <ImageIcon className="w-8 h-8 text-slate-400" />
        </div>
      ),
    },
  ];

  return (
    <div className="p-4 space-y-3">
      {components.map((component, index) => (
        <DraggableComponent key={index} {...component} />
      ))}
    </div>
  );
}
