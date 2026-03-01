import { useState } from 'react';
import clsx from 'clsx';
import {
  ChevronDown,
  ChevronRight,
  Type,
  Palette,
  LayoutGrid,
  Maximize2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Code2,
  Rows2,
  Columns2,
} from 'lucide-react';
import type { ComponentNode } from '../../types/component';

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  component: ComponentNode | null;
  onUpdate: (id: string, updates: Partial<ComponentNode>) => void;
};

type StyleKey = keyof React.CSSProperties;

// ─── Helpers ─────────────────────────────────────────────────────────────────
const px = (v: string | number | undefined) =>
  typeof v === 'number' ? v : parseFloat(String(v ?? '0')) || 0;

const toPx = (n: string | number) => (n === '' || n === 0 ? undefined : `${n}px`);

// ─── Shared input class ───────────────────────────────────────────────────────
const INPUT =
  'w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-600';

// ─── Primitive controls ───────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        {label}
      </p>
      {children}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-[72px] shrink-0 text-[10px] font-medium text-slate-400 dark:text-slate-500">
        {label}
      </span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      className={INPUT}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <textarea
      className={clsx(INPUT, 'resize-none leading-relaxed')}
      rows={3}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

function SelectInput({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select className={INPUT} value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const hex = value?.match(/^#[0-9a-fA-F]{3,8}$/) ? value : '#000000';
  return (
    <div className="flex items-center gap-1.5">
      <input
        type="color"
        className="h-7 w-7 shrink-0 cursor-pointer rounded border border-slate-200 p-0.5 dark:border-slate-700"
        value={hex}
        onChange={(e) => onChange(e.target.value)}
      />
      <input
        className={clsx(INPUT, 'font-mono')}
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
      />
    </div>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={clsx(
          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full transition-colors',
          checked ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700',
        )}
      >
        <span
          className={clsx(
            'inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5',
          )}
        />
      </button>
    </div>
  );
}

function RangeRow({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
}) {
  return (
    <FieldRow label={label}>
      <div className="flex items-center gap-2">
        <input
          type="range"
          className="flex-1 h-1 cursor-pointer accent-blue-600"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-slate-500 dark:text-slate-400">
          {value}{unit}
        </span>
      </div>
    </FieldRow>
  );
}

function NumberUnitInput({
  value,
  onChange,
  unit = 'px',
  placeholder = '0',
  min = 0,
}: {
  value: string | number | undefined;
  onChange: (v: string) => void;
  unit?: string;
  placeholder?: string;
  min?: number;
}) {
  const num = px(value as string);
  return (
    <div className="flex">
      <input
        type="number"
        className={clsx(INPUT, 'rounded-r-none border-r-0')}
        value={num === 0 && !value ? '' : num}
        min={min}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value ? `${e.target.value}${unit}` : '')}
      />
      <span className="flex items-center justify-center rounded-r-md border border-slate-200 bg-slate-50 px-2 text-[10px] text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
        {unit}
      </span>
    </div>
  );
}

function SegControl({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; icon?: React.ReactNode; label?: string }[];
}) {
  return (
    <div className="flex rounded-lg bg-slate-100 p-0.5 gap-0.5 dark:bg-slate-800">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          title={o.label ?? o.value}
          className={clsx(
            'flex-1 flex items-center justify-center rounded-md py-1.5 px-1 text-xs transition-colors',
            value === o.value
              ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
              : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200',
          )}
        >
          {o.icon ?? o.label}
        </button>
      ))}
    </div>
  );
}

// 4-way box model control (padding / margin)
function BoxControl({
  values,
  onChange,
}: {
  values: { top: string; right: string; bottom: string; left: string };
  onChange: (side: 'top' | 'right' | 'bottom' | 'left', v: string) => void;
}) {
  const n = (v: string) => v?.replace(/[^0-9.]/g, '') ?? '';
  const f = (v: string) => (v ? `${v}px` : '');

  const inp = (side: 'top' | 'right' | 'bottom' | 'left', ph: string) => (
    <input
      type="number"
      min={0}
      placeholder={ph}
      value={n(values[side])}
      onChange={(e) => onChange(side, f(e.target.value))}
      className={clsx(INPUT, 'text-center px-0 tabular-nums')}
    />
  );

  return (
    <div className="grid grid-cols-3 gap-1">
      <div />
      {inp('top', 'T')}
      <div />
      {inp('left', 'L')}
      <div className="flex items-center justify-center rounded-md border border-dashed border-slate-200 text-slate-300 text-base dark:border-slate-700 dark:text-slate-600">
        ▪
      </div>
      {inp('right', 'R')}
      <div />
      {inp('bottom', 'B')}
      <div />
    </div>
  );
}

// ─── Collapsible Section ──────────────────────────────────────────────────────
function Section({
  title,
  icon,
  accent = 'text-slate-400',
  defaultOpen = true,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  accent?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0 dark:border-slate-800">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 hover:bg-slate-50 transition-colors dark:hover:bg-slate-900/60"
      >
        {icon && <span className={clsx('shrink-0 w-4 h-4', accent)}>{icon}</span>}
        <span className="flex-1 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {open ? (
          <ChevronDown className="h-3 w-3 text-slate-400 shrink-0" />
        ) : (
          <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
        )}
      </button>
      {open && <div className="px-4 pb-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Type badge colors ────────────────────────────────────────────────────────
const TYPE_BADGE: Record<string, string> = {
  Button: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400',
  Input: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400',
  Heading: 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400',
  Text: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  Card: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400',
  Container: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400',
  Image: 'bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-400',
  NavHeader: 'bg-teal-100 text-teal-700 dark:bg-teal-950/60 dark:text-teal-400',
};

// ─── Shadow presets ────────────────────────────────────────────────────────────
const SHADOW_PRESETS = [
  { value: '', label: 'None' },
  { value: '0 1px 2px rgba(0,0,0,0.05)', label: 'XS' },
  { value: '0 1px 3px rgba(0,0,0,0.1),0 1px 2px rgba(0,0,0,0.06)', label: 'SM' },
  { value: '0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -2px rgba(0,0,0,0.1)', label: 'MD' },
  { value: '0 10px 15px -3px rgba(0,0,0,0.1),0 4px 6px -4px rgba(0,0,0,0.1)', label: 'LG' },
  { value: '0 20px 25px -5px rgba(0,0,0,0.1),0 8px 10px -6px rgba(0,0,0,0.1)', label: 'XL' },
];

// ─── Main Panel ───────────────────────────────────────────────────────────────
export function PropertiesPanel({ component, onUpdate }: Props) {
  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="rounded-xl bg-slate-100 p-3 dark:bg-slate-900">
          <Palette className="h-6 w-6 text-slate-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No selection</p>
          <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
            Click a component on the canvas to edit its properties.
          </p>
        </div>
      </div>
    );
  }

  const { type } = component;
  const style: React.CSSProperties = component.props.style ?? {};

  const updateProp = (updates: Record<string, any>) =>
    onUpdate(component.id, { props: { ...component.props, ...updates } });

  const updateStyle = (updates: React.CSSProperties) =>
    onUpdate(component.id, {
      props: { ...component.props, style: { ...style, ...updates } },
    });

  const s = style as Record<string, any>;
  const prop = component.props;

  // Convenience: spacing values
  const pad = {
    top: String(s.paddingTop ?? ''),
    right: String(s.paddingRight ?? ''),
    bottom: String(s.paddingBottom ?? ''),
    left: String(s.paddingLeft ?? ''),
  };
  const mar = {
    top: String(s.marginTop ?? ''),
    right: String(s.marginRight ?? ''),
    bottom: String(s.marginBottom ?? ''),
    left: String(s.marginLeft ?? ''),
  };

  const isText = ['Button', 'Heading', 'Text', 'Card', 'Container'].includes(type);
  const isTypography = ['Button', 'Heading', 'Text', 'Input'].includes(type);
  const isLayout = ['Container', 'Card'].includes(type);

  return (
    <div className="flex flex-col">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <span
          className={clsx(
            'inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold',
            TYPE_BADGE[type] ?? TYPE_BADGE.Text,
          )}
        >
          {type}
        </span>
        <span className="truncate text-[10px] text-slate-400 dark:text-slate-600 font-mono">
          #{component.id.split('-').slice(-2).join('-')}
        </span>
      </div>

      {/* ── Content ────────────────────────────────────────────────────── */}
      {isText && (
        <Section title="Content" icon={<Type />} accent="text-blue-500">
          <Field label="Text">
            {type === 'Text' ? (
              <Textarea
                value={prop.content ?? ''}
                onChange={(v) => updateProp({ content: v })}
                placeholder="Paragraph text…"
              />
            ) : (
              <TextInput
                value={prop.content ?? ''}
                onChange={(v) => updateProp({ content: v })}
                placeholder="Label…"
              />
            )}
          </Field>
          {type === 'Button' && (
            <>
              <Field label="Link (href)">
                <TextInput
                  value={prop.href ?? ''}
                  onChange={(v) => updateProp({ href: v })}
                  placeholder="https://…"
                />
              </Field>
              <ToggleRow
                label="Disabled"
                checked={!!prop.disabled}
                onChange={(v) => updateProp({ disabled: v })}
              />
            </>
          )}
        </Section>
      )}

      {/* Input-specific content */}
      {type === 'Input' && (
        <Section title="Input" icon={<Type />} accent="text-emerald-500">
          <Field label="Type">
            <SelectInput
              value={prop.type ?? 'text'}
              onChange={(v) => updateProp({ type: v })}
              options={[
                { value: 'text', label: 'Text' },
                { value: 'email', label: 'Email' },
                { value: 'password', label: 'Password' },
                { value: 'number', label: 'Number' },
                { value: 'tel', label: 'Tel' },
                { value: 'url', label: 'URL' },
                { value: 'search', label: 'Search' },
              ]}
            />
          </Field>
          <Field label="Placeholder">
            <TextInput
              value={prop.placeholder ?? ''}
              onChange={(v) => updateProp({ placeholder: v })}
              placeholder="Placeholder text…"
            />
          </Field>
          <Field label="Default value">
            <TextInput
              value={prop.value ?? ''}
              onChange={(v) => updateProp({ value: v })}
              placeholder="Default value…"
            />
          </Field>
          <ToggleRow
            label="Required"
            checked={!!prop.required}
            onChange={(v) => updateProp({ required: v })}
          />
          <ToggleRow
            label="Disabled"
            checked={!!prop.disabled}
            onChange={(v) => updateProp({ disabled: v })}
          />
        </Section>
      )}

      {/* Image-specific content */}
      {type === 'Image' && (
        <Section title="Image" icon={<Maximize2 />} accent="text-pink-500">
          <Field label="Source URL">
            <TextInput
              value={prop.src ?? ''}
              onChange={(v) => updateProp({ src: v })}
              placeholder="https://…"
            />
          </Field>
          <Field label="Alt text">
            <TextInput
              value={prop.alt ?? ''}
              onChange={(v) => updateProp({ alt: v })}
              placeholder="Describe image…"
            />
          </Field>
          <FieldRow label="Object fit">
            <SelectInput
              value={String(s.objectFit ?? 'cover')}
              onChange={(v) => updateStyle({ objectFit: v as any })}
              options={[
                { value: 'cover', label: 'Cover' },
                { value: 'contain', label: 'Contain' },
                { value: 'fill', label: 'Fill' },
                { value: 'none', label: 'None' },
                { value: 'scale-down', label: 'Scale down' },
              ]}
            />
          </FieldRow>
        </Section>
      )}

      {/* NavHeader-specific */}
      {type === 'NavHeader' && (
        <Section title="Header" icon={<LayoutGrid />} accent="text-teal-500">
          <Field label="Variant">
            <SelectInput
              value={prop.variant ?? 'navbar-simple'}
              onChange={(v) => updateProp({ variant: v })}
              options={[
                { value: 'navbar-simple', label: 'Simple Navbar' },
                { value: 'navbar-dark', label: 'Dark Navbar' },
                { value: 'navbar-glass', label: 'Glass Navbar' },
                { value: 'hero-gradient', label: 'Hero — Gradient' },
                { value: 'hero-split', label: 'Hero — Split' },
              ]}
            />
          </Field>
          <Field label="Brand / Title">
            <TextInput
              value={prop.title ?? ''}
              onChange={(v) => updateProp({ title: v })}
              placeholder="Brand name…"
            />
          </Field>
          <Field label="Subtitle / Headline">
            <Textarea
              value={prop.subtitle ?? ''}
              onChange={(v) => updateProp({ subtitle: v })}
              placeholder="Hero headline text…"
            />
          </Field>
          <Field label="CTA button text">
            <TextInput
              value={prop.ctaText ?? ''}
              onChange={(v) => updateProp({ ctaText: v })}
              placeholder="Get started"
            />
          </Field>
        </Section>
      )}

      {/* ── Typography ─────────────────────────────────────────────────── */}
      {isTypography && (
        <Section title="Typography" icon={<Type />} accent="text-violet-500">
          <FieldRow label="Color">
            <ColorInput
              value={String(s.color ?? '')}
              onChange={(v) => updateStyle({ color: v })}
            />
          </FieldRow>
          <FieldRow label="Size">
            <NumberUnitInput
              value={s.fontSize}
              onChange={(v) => updateStyle({ fontSize: v })}
              unit="px"
              placeholder="16"
            />
          </FieldRow>
          <FieldRow label="Weight">
            <SelectInput
              value={String(s.fontWeight ?? '')}
              onChange={(v) => updateStyle({ fontWeight: v as any })}
              options={[
                { value: '', label: '— inherit —' },
                { value: '300', label: 'Light (300)' },
                { value: '400', label: 'Regular (400)' },
                { value: '500', label: 'Medium (500)' },
                { value: '600', label: 'Semibold (600)' },
                { value: '700', label: 'Bold (700)' },
                { value: '800', label: 'Extrabold (800)' },
                { value: '900', label: 'Black (900)' },
              ]}
            />
          </FieldRow>
          {['Text', 'Heading'].includes(type) && (
            <FieldRow label="Align">
              <SegControl
                value={String(s.textAlign ?? 'left')}
                onChange={(v) => updateStyle({ textAlign: v as any })}
                options={[
                  { value: 'left', icon: <AlignLeft className="w-3.5 h-3.5" />, label: 'Left' },
                  { value: 'center', icon: <AlignCenter className="w-3.5 h-3.5" />, label: 'Center' },
                  { value: 'right', icon: <AlignRight className="w-3.5 h-3.5" />, label: 'Right' },
                  { value: 'justify', icon: <AlignJustify className="w-3.5 h-3.5" />, label: 'Justify' },
                ]}
              />
            </FieldRow>
          )}
          <FieldRow label="Line height">
            <NumberUnitInput
              value={s.lineHeight}
              onChange={(v) => updateStyle({ lineHeight: v })}
              unit="px"
              placeholder="24"
            />
          </FieldRow>
          <FieldRow label="Letter spc">
            <NumberUnitInput
              value={s.letterSpacing}
              onChange={(v) => updateStyle({ letterSpacing: v })}
              unit="px"
              placeholder="0"
            />
          </FieldRow>
          {type === 'Text' && (
            <FieldRow label="Style">
              <SegControl
                value={String(s.fontStyle ?? 'normal')}
                onChange={(v) => updateStyle({ fontStyle: v as any })}
                options={[
                  { value: 'normal', label: 'Normal' },
                  { value: 'italic', label: 'Italic' },
                ]}
              />
            </FieldRow>
          )}
        </Section>
      )}

      {/* ── Size ───────────────────────────────────────────────────────── */}
      <Section title="Size" icon={<Maximize2 />} accent="text-sky-500">
        <div className="grid grid-cols-2 gap-2">
          <Field label="Width">
            <NumberUnitInput
              value={s.width}
              onChange={(v) => updateStyle({ width: v })}
              unit="px"
              placeholder="auto"
            />
          </Field>
          <Field label="Height">
            <NumberUnitInput
              value={s.height}
              onChange={(v) => updateStyle({ height: v })}
              unit="px"
              placeholder="auto"
            />
          </Field>
          <Field label="Min W">
            <NumberUnitInput
              value={s.minWidth}
              onChange={(v) => updateStyle({ minWidth: v })}
              unit="px"
              placeholder="—"
            />
          </Field>
          <Field label="Max W">
            <NumberUnitInput
              value={s.maxWidth}
              onChange={(v) => updateStyle({ maxWidth: v })}
              unit="px"
              placeholder="—"
            />
          </Field>
          <Field label="Min H">
            <NumberUnitInput
              value={s.minHeight}
              onChange={(v) => updateStyle({ minHeight: v })}
              unit="px"
              placeholder="—"
            />
          </Field>
          <Field label="Max H">
            <NumberUnitInput
              value={s.maxHeight}
              onChange={(v) => updateStyle({ maxHeight: v })}
              unit="px"
              placeholder="—"
            />
          </Field>
        </div>
      </Section>

      {/* ── Spacing ────────────────────────────────────────────────────── */}
      <Section title="Spacing" icon={<LayoutGrid />} accent="text-orange-500" defaultOpen={false}>
        <Field label="Padding (px)">
          <BoxControl
            values={pad}
            onChange={(side, v) =>
              updateStyle({
                [`padding${side.charAt(0).toUpperCase()}${side.slice(1)}`]: v || undefined,
              } as React.CSSProperties)
            }
          />
        </Field>
        <Field label="Margin (px)">
          <BoxControl
            values={mar}
            onChange={(side, v) =>
              updateStyle({
                [`margin${side.charAt(0).toUpperCase()}${side.slice(1)}`]: v || undefined,
              } as React.CSSProperties)
            }
          />
        </Field>
      </Section>

      {/* ── Appearance ─────────────────────────────────────────────────── */}
      <Section title="Appearance" icon={<Palette />} accent="text-rose-500">
        {type !== 'Image' && (
          <FieldRow label="Background">
            <ColorInput
              value={String(s.backgroundColor ?? '')}
              onChange={(v) => updateStyle({ backgroundColor: v })}
            />
          </FieldRow>
        )}
        <RangeRow
          label="Radius"
          value={px(s.borderRadius)}
          onChange={(v) => updateStyle({ borderRadius: toPx(v) })}
          min={0}
          max={48}
          unit="px"
        />
        <FieldRow label="Border">
          <div className="flex gap-1">
            <input
              type="number"
              min={0}
              max={20}
              className={clsx(INPUT, 'w-14 shrink-0')}
              value={px(s.borderWidth)}
              placeholder="0"
              onChange={(e) =>
                updateStyle({ borderWidth: toPx(e.target.value), borderStyle: s.borderStyle || 'solid' })
              }
            />
            <SelectInput
              value={String(s.borderStyle ?? 'solid')}
              onChange={(v) => updateStyle({ borderStyle: v as any })}
              options={[
                { value: 'solid', label: 'Solid' },
                { value: 'dashed', label: 'Dashed' },
                { value: 'dotted', label: 'Dotted' },
                { value: 'double', label: 'Double' },
              ]}
            />
          </div>
        </FieldRow>
        {(s.borderWidth || s.border) && (
          <FieldRow label="Border color">
            <ColorInput
              value={String(s.borderColor ?? '#e2e8f0')}
              onChange={(v) => updateStyle({ borderColor: v })}
            />
          </FieldRow>
        )}
        <FieldRow label="Shadow">
          <SelectInput
            value={SHADOW_PRESETS.find((p) => p.value === s.boxShadow)?.value ?? ''}
            onChange={(v) => updateStyle({ boxShadow: v || undefined })}
            options={SHADOW_PRESETS}
          />
        </FieldRow>
        <RangeRow
          label="Opacity"
          value={Math.round((s.opacity ?? 1) * 100)}
          onChange={(v) => updateStyle({ opacity: v / 100 })}
          min={0}
          max={100}
          unit="%"
        />
      </Section>

      {/* ── Layout (Container / Card) ───────────────────────────────────── */}
      {isLayout && (
        <Section title="Layout" icon={<LayoutGrid />} accent="text-indigo-500">
          <FieldRow label="Display">
            <SelectInput
              value={String(s.display ?? 'block')}
              onChange={(v) => updateStyle({ display: v as any })}
              options={[
                { value: 'block', label: 'Block' },
                { value: 'flex', label: 'Flex' },
                { value: 'inline-flex', label: 'Inline Flex' },
                { value: 'grid', label: 'Grid' },
                { value: 'inline-block', label: 'Inline Block' },
              ]}
            />
          </FieldRow>
          {(s.display === 'flex' || s.display === 'inline-flex') && (
            <>
              <FieldRow label="Direction">
                <SegControl
                  value={String(s.flexDirection ?? 'row')}
                  onChange={(v) => updateStyle({ flexDirection: v as any })}
                  options={[
                    { value: 'row', icon: <Rows2 className="w-3.5 h-3.5" />, label: 'Row' },
                    { value: 'column', icon: <Columns2 className="w-3.5 h-3.5" />, label: 'Column' },
                  ]}
                />
              </FieldRow>
              <FieldRow label="Justify">
                <SelectInput
                  value={String(s.justifyContent ?? 'flex-start')}
                  onChange={(v) => updateStyle({ justifyContent: v as any })}
                  options={[
                    { value: 'flex-start', label: 'Start' },
                    { value: 'center', label: 'Center' },
                    { value: 'flex-end', label: 'End' },
                    { value: 'space-between', label: 'Space between' },
                    { value: 'space-around', label: 'Space around' },
                    { value: 'space-evenly', label: 'Space evenly' },
                  ]}
                />
              </FieldRow>
              <FieldRow label="Align">
                <SelectInput
                  value={String(s.alignItems ?? 'stretch')}
                  onChange={(v) => updateStyle({ alignItems: v as any })}
                  options={[
                    { value: 'stretch', label: 'Stretch' },
                    { value: 'flex-start', label: 'Start' },
                    { value: 'center', label: 'Center' },
                    { value: 'flex-end', label: 'End' },
                    { value: 'baseline', label: 'Baseline' },
                  ]}
                />
              </FieldRow>
              <FieldRow label="Wrap">
                <SegControl
                  value={String(s.flexWrap ?? 'nowrap')}
                  onChange={(v) => updateStyle({ flexWrap: v as any })}
                  options={[
                    { value: 'nowrap', label: 'No wrap' },
                    { value: 'wrap', label: 'Wrap' },
                  ]}
                />
              </FieldRow>
              <FieldRow label="Gap">
                <NumberUnitInput
                  value={s.gap}
                  onChange={(v) => updateStyle({ gap: v })}
                  unit="px"
                  placeholder="0"
                />
              </FieldRow>
            </>
          )}
          {s.display === 'grid' && (
            <>
              <FieldRow label="Columns">
                <TextInput
                  value={String(s.gridTemplateColumns ?? '')}
                  onChange={(v) => updateStyle({ gridTemplateColumns: v })}
                  placeholder="repeat(3, 1fr)"
                />
              </FieldRow>
              <FieldRow label="Rows">
                <TextInput
                  value={String(s.gridTemplateRows ?? '')}
                  onChange={(v) => updateStyle({ gridTemplateRows: v })}
                  placeholder="auto"
                />
              </FieldRow>
              <FieldRow label="Gap">
                <NumberUnitInput
                  value={s.gap}
                  onChange={(v) => updateStyle({ gap: v })}
                  unit="px"
                  placeholder="0"
                />
              </FieldRow>
            </>
          )}
        </Section>
      )}

      {/* ── Advanced ───────────────────────────────────────────────────── */}
      <Section title="Advanced" icon={<Code2 />} accent="text-slate-400" defaultOpen={false}>
        <Field label="Tailwind classes">
          <Textarea
            value={prop.className ?? ''}
            onChange={(v) => updateProp({ className: v })}
            placeholder="px-4 py-2 bg-blue-500 text-white …"
          />
        </Field>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-relaxed">
          Raw Tailwind utility classes. These are applied alongside inline styles.
        </p>
      </Section>
    </div>
  );
}
