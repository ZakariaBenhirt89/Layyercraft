import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import type { ComponentNode } from '../../types/component';
import { DropZone } from './DropZone';
import { isContainerType } from '../../utils/componentTypes';

// ─── Shared hamburger button ──────────────────────────────────────────────────

function Hamburger({
  open,
  onToggle,
  light = false,
}: {
  open: boolean;
  onToggle: (e: React.MouseEvent) => void;
  light?: boolean;
}) {
  const bar = light ? 'bg-white' : 'bg-zinc-900';
  return (
    <button
      onClick={onToggle}
      className="flex @sm:hidden flex-col items-center justify-center w-9 h-9 gap-[5px] rounded-lg transition-colors hover:bg-black/5"
      aria-label={open ? 'Close menu' : 'Open menu'}
    >
      <span
        className={`block h-[2px] w-5 rounded-full transition-all duration-200 ${bar} ${
          open ? 'translate-y-[7px] rotate-45' : ''
        }`}
      />
      <span
        className={`block h-[2px] w-5 rounded-full transition-all duration-200 ${bar} ${
          open ? 'opacity-0 scale-x-0' : ''
        }`}
      />
      <span
        className={`block h-[2px] w-5 rounded-full transition-all duration-200 ${bar} ${
          open ? '-translate-y-[7px] -rotate-45' : ''
        }`}
      />
    </button>
  );
}

// ─── NavHeader variants ───────────────────────────────────────────────────────

function NavHeaderSimple({ title, ctaText }: { title: string; ctaText?: string }) {
  const [open, setOpen] = useState(false);
  const links = ['Product', 'Pricing', 'About'];
  const cta = ctaText || 'Get started';

  return (
    <header className="@container w-full bg-white border-b border-zinc-200 select-none relative">
      <div className="flex h-14 items-center justify-between px-6 max-w-6xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <span className="text-base font-bold text-zinc-900 tracking-tight pointer-events-none">
            {title || 'Brand'}
          </span>
          <nav className="hidden @sm:flex items-center gap-6">
            {links.map((l) => (
              <span key={l} className="text-sm text-zinc-500 pointer-events-none">{l}</span>
            ))}
          </nav>
        </div>
        {/* Desktop CTA */}
        <div className="hidden @sm:flex items-center gap-3 pointer-events-none">
          <span className="text-sm text-zinc-600">Sign in</span>
          <span className="inline-flex items-center px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-semibold shadow-sm">
            {cta}
          </span>
        </div>
        {/* Mobile hamburger */}
        <Hamburger open={open} onToggle={(e) => { e.stopPropagation(); setOpen((o) => !o); }} />
      </div>

      {/* Mobile drawer */}
      <div
        className={`@sm:hidden overflow-hidden transition-all duration-200 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-t border-zinc-100 px-6 py-3 space-y-1">
          {links.map((l) => (
            <div
              key={l}
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0"
            >
              {l}
            </div>
          ))}
          <div className="pt-3 pb-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-center text-sm text-zinc-500">Sign in</span>
            <span className="flex justify-center px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold">
              {cta}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavHeaderDark({ title, ctaText }: { title: string; ctaText?: string }) {
  const [open, setOpen] = useState(false);
  const links = ['Features', 'Docs', 'Blog'];
  const cta = ctaText || 'Get Started →';

  return (
    <header className="@container w-full bg-zinc-950 select-none relative">
      <div className="flex h-14 items-center justify-between px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-8">
          <span className="text-base font-bold text-white tracking-tight pointer-events-none">
            {title || 'Brand'}
          </span>
          <nav className="hidden @sm:flex items-center gap-6">
            {links.map((l) => (
              <span key={l} className="text-sm text-zinc-400 pointer-events-none">{l}</span>
            ))}
          </nav>
        </div>
        <span className="hidden @sm:inline-flex items-center px-4 py-1.5 rounded-full text-white text-sm font-semibold pointer-events-none"
          style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}>
          {cta}
        </span>
        <Hamburger open={open} light onToggle={(e) => { e.stopPropagation(); setOpen((o) => !o); }} />
      </div>

      {/* Mobile drawer */}
      <div
        className={`@sm:hidden overflow-hidden transition-all duration-200 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-zinc-900 border-t border-zinc-800 px-6 py-3 space-y-1">
          {links.map((l) => (
            <div
              key={l}
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 text-sm font-medium text-zinc-300 border-b border-zinc-800 last:border-0"
            >
              {l}
            </div>
          ))}
          <div className="pt-3 pb-1" onClick={(e) => e.stopPropagation()}>
            <span className="flex justify-center px-4 py-2.5 rounded-full text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(90deg,#6366f1,#8b5cf6)' }}>
              {cta}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavHeaderGlass({ title, ctaText }: { title: string; ctaText?: string }) {
  const [open, setOpen] = useState(false);
  const links = ['Home', 'Features', 'Pricing', 'Contact'];
  const cta = ctaText || 'Free trial';

  return (
    <header
      className="@container w-full select-none relative"
      style={{ background: 'rgba(255,255,255,0.75)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}
    >
      <div className="flex h-14 items-center justify-between px-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 pointer-events-none">
            <div className="w-7 h-7 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }} />
            <span className="text-base font-bold text-zinc-900 tracking-tight">{title || 'Brand'}</span>
          </div>
          <nav className="hidden @sm:flex items-center gap-5">
            {links.map((l) => (
              <span key={l} className="text-sm text-zinc-600 pointer-events-none">{l}</span>
            ))}
          </nav>
        </div>
        <div className="hidden @sm:flex items-center gap-2 pointer-events-none">
          <span className="text-sm text-zinc-600">Log in</span>
          <span className="inline-flex items-center px-4 py-2 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm font-semibold shadow-sm">
            {cta}
          </span>
        </div>
        <Hamburger open={open} onToggle={(e) => { e.stopPropagation(); setOpen((o) => !o); }} />
      </div>

      {/* Mobile drawer */}
      <div
        className={`@sm:hidden overflow-hidden transition-all duration-200 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div
          className="border-t px-6 py-3 space-y-1"
          style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderColor: 'rgba(0,0,0,0.07)' }}
        >
          {links.map((l) => (
            <div
              key={l}
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 text-sm font-medium text-zinc-700 border-b border-zinc-100 last:border-0"
            >
              {l}
            </div>
          ))}
          <div className="pt-3 pb-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-center text-sm text-zinc-500">Log in</span>
            <span className="flex justify-center px-4 py-2.5 rounded-lg border border-zinc-200 bg-white text-zinc-900 text-sm font-semibold shadow-sm">
              {cta}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavHeaderHeroGradient({
  title,
  subtitle,
  ctaText,
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
}) {
  const [open, setOpen] = useState(false);
  const links = ['Product', 'Pricing', 'Docs'];
  const cta = ctaText || 'Get started';

  return (
    <header
      className="@container w-full select-none relative"
      style={{ background: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)' }}
    >
      {/* Navbar */}
      <div className="flex h-14 items-center justify-between px-6 max-w-6xl mx-auto">
        <span className="text-base font-bold text-white tracking-tight pointer-events-none">
          {title || 'Brand'}
        </span>
        <nav className="hidden @sm:flex items-center gap-6">
          {links.map((l) => (
            <span key={l} className="text-sm text-indigo-200 pointer-events-none">{l}</span>
          ))}
        </nav>
        <span className="hidden @sm:inline-flex items-center px-4 py-1.5 rounded-lg text-white text-sm font-semibold pointer-events-none"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
          {cta}
        </span>
        <Hamburger open={open} light onToggle={(e) => { e.stopPropagation(); setOpen((o) => !o); }} />
      </div>

      {/* Mobile drawer */}
      <div
        className={`@sm:hidden overflow-hidden transition-all duration-200 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-3 space-y-1" style={{ background: 'rgba(0,0,0,0.15)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {links.map((l) => (
            <div
              key={l}
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 text-sm font-medium text-white/90"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}
            >
              {l}
            </div>
          ))}
          <div className="pt-3 pb-1" onClick={(e) => e.stopPropagation()}>
            <span className="flex justify-center px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
              style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
              {cta}
            </span>
          </div>
        </div>
      </div>

      {/* Hero section */}
      <div className="py-12 px-6 text-center max-w-3xl mx-auto pointer-events-none">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-white/90 text-xs font-medium mb-5"
          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.2)' }}>
          ✨ New — Version 2.0 is here
        </span>
        <h1 className="text-3xl @sm:text-4xl font-bold text-white leading-tight mb-4">
          {subtitle || 'Build beautiful UIs faster than ever'}
        </h1>
        <p className="text-base @sm:text-lg text-indigo-200 mb-8 max-w-xl mx-auto">
          The modern design system for teams who ship fast. Composable, accessible, and open source.
        </p>
        <div className="flex flex-col @sm:flex-row items-center justify-center gap-3">
          <span className="w-full @sm:w-auto inline-flex justify-center items-center px-6 py-3 rounded-xl bg-white text-indigo-700 text-sm font-bold shadow-lg">
            Start building →
          </span>
          <span className="w-full @sm:w-auto inline-flex justify-center items-center px-6 py-3 rounded-xl text-white text-sm font-semibold"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}>
            View demo
          </span>
        </div>
      </div>
    </header>
  );
}

function NavHeaderHeroSplit({
  title,
  subtitle,
  ctaText,
}: {
  title: string;
  subtitle?: string;
  ctaText?: string;
}) {
  const [open, setOpen] = useState(false);
  const links = ['Product', 'Solutions', 'Pricing', 'Blog'];
  const cta = ctaText || 'Start for free';

  return (
    <header className="@container w-full bg-white select-none relative">
      {/* Navbar */}
      <div className="flex h-14 items-center justify-between px-6 border-b border-zinc-100">
        <div className="flex items-center gap-2 pointer-events-none">
          <div className="w-7 h-7 rounded-lg shrink-0" style={{ background: 'linear-gradient(135deg,#f43f5e,#f97316)' }} />
          <span className="text-base font-bold text-zinc-900">{title || 'Brand'}</span>
        </div>
        <nav className="hidden @sm:flex items-center gap-6">
          {links.map((l) => (
            <span key={l} className="text-sm text-zinc-500 pointer-events-none">{l}</span>
          ))}
        </nav>
        <div className="hidden @sm:flex items-center gap-3 pointer-events-none">
          <span className="text-sm text-zinc-600">Log in</span>
          <span className="inline-flex px-4 py-2 rounded-lg text-white text-sm font-semibold shadow-sm"
            style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316)' }}>
            {cta}
          </span>
        </div>
        <Hamburger open={open} onToggle={(e) => { e.stopPropagation(); setOpen((o) => !o); }} />
      </div>

      {/* Mobile drawer */}
      <div
        className={`@sm:hidden overflow-hidden transition-all duration-200 ${
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="bg-white border-b border-zinc-100 px-6 py-3 space-y-1">
          {links.map((l) => (
            <div
              key={l}
              onClick={(e) => e.stopPropagation()}
              className="py-2.5 text-sm font-medium text-zinc-700 border-b border-zinc-50 last:border-0"
            >
              {l}
            </div>
          ))}
          <div className="pt-3 pb-1 flex flex-col gap-2" onClick={(e) => e.stopPropagation()}>
            <span className="text-center text-sm text-zinc-500">Log in</span>
            <span className="flex justify-center px-4 py-2.5 rounded-lg text-white text-sm font-semibold"
              style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316)' }}>
              {cta}
            </span>
          </div>
        </div>
      </div>

      {/* Hero split — single col on mobile, two cols on @sm+ */}
      <div className="grid grid-cols-1 @sm:grid-cols-2">
        <div className="flex flex-col justify-center px-6 @sm:px-10 py-10 @sm:py-12 pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold w-fit mb-4">
            🚀 Now in beta
          </span>
          <h1 className="text-2xl @sm:text-3xl font-bold text-zinc-900 leading-tight mb-3">
            {subtitle || 'Ship your product 10x faster'}
          </h1>
          <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
            The component library that scales with your team. Build, iterate, ship.
          </p>
          <div className="flex flex-col @sm:flex-row items-stretch @sm:items-center gap-3">
            <span className="flex justify-center px-5 py-2.5 rounded-lg text-white text-sm font-bold shadow-sm"
              style={{ background: 'linear-gradient(90deg,#f43f5e,#f97316)' }}>
              {cta}
            </span>
            <span className="flex justify-center text-sm text-zinc-600 items-center gap-1">
              Watch demo ▶
            </span>
          </div>
        </div>
        {/* Right block — hidden on mobile */}
        <div className="hidden @sm:flex bg-gradient-to-br from-rose-50 to-orange-50 items-center justify-center min-h-[180px]">
          <div className="w-28 h-28 rounded-2xl opacity-60"
            style={{ background: 'linear-gradient(135deg,#fb7185,#fb923c)' }} />
        </div>
      </div>
    </header>
  );
}

function NavHeaderRenderer({
  node,
  onRemove,
  onSelect,
  selected,
}: {
  node: ComponentNode;
  onRemove: (id: string) => void;
  onSelect: (id: string) => void;
  selected: boolean;
}) {
  const { props, id } = node;
  const ring = selected ? 'ring-2 ring-blue-400 ring-opacity-70' : '';
  const variant = props.variant ?? 'navbar-simple';

  const inner = (() => {
    switch (variant) {
      case 'navbar-dark':   return <NavHeaderDark title={props.title} ctaText={props.ctaText} />;
      case 'navbar-glass':  return <NavHeaderGlass title={props.title} ctaText={props.ctaText} />;
      case 'hero-gradient': return <NavHeaderHeroGradient title={props.title} subtitle={props.subtitle} ctaText={props.ctaText} />;
      case 'hero-split':    return <NavHeaderHeroSplit title={props.title} subtitle={props.subtitle} ctaText={props.ctaText} />;
      default:              return <NavHeaderSimple title={props.title} ctaText={props.ctaText} />;
    }
  })();

  return (
    <div
      key={id}
      className={`relative group w-full rounded-xl overflow-hidden ${ring}`}
      onClick={(e) => { e.stopPropagation(); onSelect(id); }}
    >
      {inner}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(id); }}
        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
}

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
    case 'NavHeader':
      return (
        <NavHeaderRenderer
          key={id}
          node={node}
          onRemove={onRemove}
          onSelect={onSelect}
          selected={selected}
        />
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
        style={props.style}
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
