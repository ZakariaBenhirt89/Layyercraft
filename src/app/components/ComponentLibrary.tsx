import { useDrag } from 'react-dnd';
import {
  Square,
  Type,
  Heading1,
  Image as ImageIcon,
  MousePointer,
  CreditCard,
  LayoutGrid,
  PanelTop,
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
        <div className="p-2 bg-blue-50 rounded-lg text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          {icon}
        </div>
        <span className="text-sm text-slate-700 dark:text-slate-200">{label}</span>
      </div>
      <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 dark:bg-slate-900 dark:border-slate-800 overflow-hidden pointer-events-none select-none">
        {preview}
      </div>
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 pt-2 pb-1">
      <span className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

// ─── Mini header previews (thumbnail scale) ──────────────────────────────────

function PreviewSimpleNav() {
  return (
    <div className="w-full rounded overflow-hidden border border-zinc-200 bg-white" style={{ fontSize: 0 }}>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-zinc-100">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-zinc-800">Brand</span>
          <div className="flex gap-2">
            {['Product', 'Pricing', 'About'].map((l) => (
              <span key={l} className="text-[8px] text-zinc-400">{l}</span>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[8px] text-zinc-400">Sign in</span>
          <span className="px-2 py-0.5 rounded bg-zinc-900 text-white text-[8px] font-semibold">Start</span>
        </div>
      </div>
    </div>
  );
}

function PreviewDarkNav() {
  return (
    <div className="w-full rounded overflow-hidden" style={{ background: '#09090b' }}>
      <div className="flex items-center justify-between px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold text-white">Brand</span>
          <div className="flex gap-2">
            {['Features', 'Docs', 'Blog'].map((l) => (
              <span key={l} className="text-[8px] text-zinc-500">{l}</span>
            ))}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded-full text-white text-[8px] font-semibold" style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}>
          Get Started →
        </span>
      </div>
    </div>
  );
}

function PreviewGlassNav() {
  return (
    <div className="w-full rounded overflow-hidden" style={{ background: 'linear-gradient(135deg,#e0e7ff 0%,#f5d0fe 100%)' }}>
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{ background: 'rgba(255,255,255,0.65)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gradient-to-br from-indigo-500 to-violet-600" />
          <span className="text-[9px] font-bold text-zinc-800">Brand</span>
          <div className="flex gap-2">
            {['Home', 'Features', 'Pricing'].map((l) => (
              <span key={l} className="text-[8px] text-zinc-500">{l}</span>
            ))}
          </div>
        </div>
        <span className="px-2 py-0.5 rounded border border-zinc-200 bg-white text-zinc-800 text-[8px] font-semibold shadow-sm">
          Free trial
        </span>
      </div>
    </div>
  );
}

function PreviewHeroGradient() {
  return (
    <div className="w-full rounded overflow-hidden" style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)' }}>
      {/* Mini nav */}
      <div className="flex items-center justify-between px-3 py-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <span className="text-[8px] font-bold text-white">Brand</span>
        <span className="px-2 py-0.5 rounded text-white text-[8px]" style={{ background: 'rgba(255,255,255,0.15)' }}>Start</span>
      </div>
      {/* Hero text */}
      <div className="px-4 py-4 text-center">
        <span className="inline-block px-2 py-0.5 rounded-full text-[7px] text-white/80 mb-1.5" style={{ background: 'rgba(255,255,255,0.15)' }}>
          ✨ Version 2.0
        </span>
        <div className="text-[11px] font-bold text-white leading-tight mb-1">
          Build beautiful UIs faster
        </div>
        <div className="text-[8px] text-indigo-200 mb-2.5">The modern design system for teams.</div>
        <div className="flex justify-center gap-2">
          <span className="px-2.5 py-1 rounded-md bg-white text-indigo-700 text-[8px] font-bold">Start building</span>
          <span className="px-2.5 py-1 rounded-md text-white text-[8px]" style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}>Demo</span>
        </div>
      </div>
    </div>
  );
}

function PreviewHeroSplit() {
  return (
    <div className="w-full rounded overflow-hidden border border-zinc-100 bg-white">
      {/* Mini nav */}
      <div className="flex items-center justify-between px-3 py-1 border-b border-zinc-100">
        <div className="flex items-center gap-1">
          <div className="w-2.5 h-2.5 rounded bg-gradient-to-br from-rose-500 to-orange-500" />
          <span className="text-[8px] font-bold text-zinc-800">Brand</span>
        </div>
        <span className="px-2 py-0.5 rounded text-white text-[8px] font-semibold" style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316)' }}>
          Get started
        </span>
      </div>
      {/* Split hero */}
      <div className="grid grid-cols-2" style={{ minHeight: 52 }}>
        <div className="px-3 py-3 flex flex-col justify-center">
          <span className="inline-block px-1.5 py-0.5 rounded-full bg-rose-50 text-rose-600 text-[7px] font-semibold mb-1">🚀 Beta</span>
          <div className="text-[9px] font-bold text-zinc-900 leading-tight mb-1">Ship 10x faster</div>
          <div className="text-[7px] text-zinc-400 mb-1.5">Build, iterate, ship.</div>
          <span className="inline-block px-2 py-0.5 rounded text-white text-[7px] font-bold w-fit" style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316)' }}>
            Start free
          </span>
        </div>
        <div className="flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#fff1f2,#fff7ed)' }}>
          <div className="w-8 h-8 rounded-xl" style={{ background: 'linear-gradient(135deg,#fb7185,#fb923c)', opacity: 0.7 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Component library data ───────────────────────────────────────────────────

export function ComponentLibrary() {
  const headerComponents = [
    {
      type: 'NavHeader',
      icon: <PanelTop className="w-4 h-4" />,
      label: 'Simple Navbar',
      props: { variant: 'navbar-simple', title: 'Brand' },
      preview: <PreviewSimpleNav />,
    },
    {
      type: 'NavHeader',
      icon: <PanelTop className="w-4 h-4" />,
      label: 'Dark Navbar',
      props: { variant: 'navbar-dark', title: 'Brand' },
      preview: <PreviewDarkNav />,
    },
    {
      type: 'NavHeader',
      icon: <PanelTop className="w-4 h-4" />,
      label: 'Glass Navbar',
      props: { variant: 'navbar-glass', title: 'Brand' },
      preview: <PreviewGlassNav />,
    },
    {
      type: 'NavHeader',
      icon: <PanelTop className="w-4 h-4" />,
      label: 'Hero — Gradient',
      props: { variant: 'hero-gradient', title: 'Brand', subtitle: 'Build beautiful UIs faster than ever' },
      preview: <PreviewHeroGradient />,
    },
    {
      type: 'NavHeader',
      icon: <PanelTop className="w-4 h-4" />,
      label: 'Hero — Split',
      props: { variant: 'hero-split', title: 'Brand', subtitle: 'Ship your product 10x faster' },
      preview: <PreviewHeroSplit />,
    },
  ];

  const uiComponents = [
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
      props: { className: 'text-4xl text-slate-900' },
      children: 'Welcome to our site',
      preview: <h2 className="text-2xl text-slate-900">Welcome to our site</h2>,
    },
    {
      type: 'Heading',
      icon: <Heading1 className="w-4 h-4" />,
      label: 'Medium Heading',
      props: { className: 'text-2xl text-slate-800' },
      children: 'Section Title',
      preview: <h2 className="text-lg text-slate-800">Section Title</h2>,
    },
    {
      type: 'Text',
      icon: <Type className="w-4 h-4" />,
      label: 'Paragraph',
      props: { className: 'text-slate-600 leading-relaxed' },
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
      props: { className: 'p-6 bg-white border-2 border-slate-200 rounded-xl shadow-sm' },
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
      props: { className: 'p-6 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg' },
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
      props: { className: 'p-8 border-2 border-dashed border-slate-300 rounded-xl' },
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
      props: { className: 'flex gap-4 p-6 border-2 border-dashed border-slate-300 rounded-xl' },
      children: 'Flex Container',
      preview: (
        <div className="flex gap-2 p-3 border-2 border-dashed border-slate-300 rounded-lg">
          <div className="flex-1 h-8 bg-slate-200 rounded" />
          <div className="flex-1 h-8 bg-slate-200 rounded" />
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
      <SectionLabel label="Headers & Navigation" />
      {headerComponents.map((component, index) => (
        <DraggableComponent key={`header-${index}`} {...component} />
      ))}

      <SectionLabel label="UI Components" />
      {uiComponents.map((component, index) => (
        <DraggableComponent key={`ui-${index}`} {...component} />
      ))}
    </div>
  );
}
