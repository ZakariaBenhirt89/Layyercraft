import { useEffect, useId, useState } from 'react';
import { motion, LayoutGroup } from 'motion/react';
import {
  Monitor,
  Tablet,
  Smartphone,
  Code,
  Trash2,
  Download,
  Sun,
  Moon,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import clsx from 'clsx';

type ToolbarProps = {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  showCode: boolean;
  setShowCode: (show: boolean) => void;
  clearCanvas: () => void;
  rightPanelMode: 'inspector' | 'ai';
  setRightPanelMode: (mode: 'inspector' | 'ai') => void;
};

// ─── Catalyst-inspired animated tab item ────────────────────────────────────
function NavTab({
  current,
  onClick,
  children,
  layoutId,
}: {
  current: boolean;
  onClick: () => void;
  children: React.ReactNode;
  layoutId: string;
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150 outline-none',
        current
          ? 'text-zinc-900 dark:text-white'
          : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200',
      )}
    >
      {current && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-lg bg-white shadow-sm dark:bg-zinc-800 dark:shadow-none dark:ring-1 dark:ring-white/10"
          style={{ zIndex: -1 }}
          transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
        />
      )}
      {children}
    </button>
  );
}

// ─── Catalyst-inspired icon-only action button ───────────────────────────────
function IconButton({
  active,
  onClick,
  title,
  danger,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  title?: string;
  danger?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={clsx(
        'relative flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors duration-150',
        active
          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
          : danger
            ? 'text-zinc-500 hover:bg-red-50 hover:text-red-600 dark:text-zinc-400 dark:hover:bg-red-950/40 dark:hover:text-red-400'
            : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white',
      )}
    >
      {children}
    </button>
  );
}

// ─── Catalyst-inspired solid pill button ─────────────────────────────────────
function PillButton({
  active,
  onClick,
  children,
  variant = 'default',
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'default' | 'ai' | 'export';
}) {
  if (variant === 'export') {
    return (
      <button
        onClick={onClick}
        className="relative isolate inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white
          bg-gradient-to-b from-indigo-500 to-indigo-600
          shadow-[0_1px_2px_rgba(0,0,0,.12),inset_0_1px_0_rgba(255,255,255,.15)]
          hover:from-indigo-400 hover:to-indigo-500
          transition-all duration-150"
      >
        {children}
      </button>
    );
  }

  if (variant === 'ai') {
    return (
      <button
        onClick={onClick}
        className={clsx(
          'relative isolate inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
          active
            ? 'bg-violet-600 text-white shadow-[0_1px_2px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.12)]'
            : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10',
        )}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={clsx(
        'relative isolate inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150',
        active
          ? 'bg-zinc-900 text-white shadow-[0_1px_2px_rgba(0,0,0,.15),inset_0_1px_0_rgba(255,255,255,.12)] dark:bg-white dark:text-zinc-900'
          : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10',
      )}
    >
      {children}
    </button>
  );
}

// ─── Avatar (Catalyst-inspired) ──────────────────────────────────────────────
function Avatar({ initials }: { initials: string }) {
  return (
    <span
      className="inline-grid shrink-0 size-8 rounded-full
        bg-gradient-to-br from-violet-500 to-indigo-600
        outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10
        *:col-start-1 *:row-start-1"
    >
      <svg
        className="size-full fill-white text-[48px] font-semibold uppercase select-none"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <text
          x="50%"
          y="50%"
          alignmentBaseline="middle"
          dominantBaseline="middle"
          textAnchor="middle"
          dy=".125em"
        >
          {initials}
        </text>
      </svg>
    </span>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function NavDivider() {
  return (
    <div
      aria-hidden="true"
      className="h-5 w-px bg-zinc-950/10 dark:bg-white/10 mx-1"
    />
  );
}

// ─── Main Toolbar ─────────────────────────────────────────────────────────────
export function Toolbar({
  viewMode,
  setViewMode,
  showCode,
  setShowCode,
  clearCanvas,
  rightPanelMode,
  setRightPanelMode,
}: ToolbarProps) {
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const viewTabId = useId();
  const themeTabId = useId();

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setTheme(stored as 'light' | 'dark' | 'system');
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  return (
    <header className="relative z-10 border-b border-zinc-950/5 bg-white/90 backdrop-blur-sm dark:border-white/5 dark:bg-zinc-950/90">
      <div className="flex h-14 items-center justify-between gap-4 px-4">

        {/* ── Left: Brand ──────────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0 shrink-0">
          {/* Logo mark */}
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl
            bg-gradient-to-br from-indigo-500 to-violet-600
            shadow-[0_1px_2px_rgba(0,0,0,.18),inset_0_1px_0_rgba(255,255,255,.18)]"
          >
            <img
              src="/logo/logowhite.svg"
              alt=""
              className="h-5 w-5 block"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = 'none';
              }}
            />
            <Sparkles className="h-5 w-5 text-white absolute" aria-hidden="true" />
          </div>

          {/* Brand text */}
          <div className="leading-none">
            <p className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
              Layercraft
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">UI Builder</p>
          </div>

          {/* Catalyst-style badge */}
          <span className="hidden sm:inline-flex items-center rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
            Beta
          </span>
        </div>

        {/* ── Center: View Mode Tabs (Catalyst-inspired animated) ── */}
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 gap-0.5">
          <LayoutGroup id={viewTabId}>
            <NavTab
              current={viewMode === 'desktop'}
              onClick={() => setViewMode('desktop')}
              layoutId={`${viewTabId}-indicator`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Desktop</span>
            </NavTab>
            <NavTab
              current={viewMode === 'tablet'}
              onClick={() => setViewMode('tablet')}
              layoutId={`${viewTabId}-indicator`}
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tablet</span>
            </NavTab>
            <NavTab
              current={viewMode === 'mobile'}
              onClick={() => setViewMode('mobile')}
              layoutId={`${viewTabId}-indicator`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mobile</span>
            </NavTab>
          </LayoutGroup>
        </div>

        {/* ── Right: Actions ───────────────────────────────── */}
        <div className="flex items-center gap-1 shrink-0">

          {/* Theme switcher (Catalyst-style animated) */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 gap-0.5">
            <LayoutGroup id={themeTabId}>
              <NavTab
                current={theme === 'light'}
                onClick={() => setTheme('light')}
                layoutId={`${themeTabId}-indicator`}
              >
                <Sun className="w-3.5 h-3.5" />
              </NavTab>
              <NavTab
                current={theme === 'system'}
                onClick={() => setTheme('system')}
                layoutId={`${themeTabId}-indicator`}
              >
                <Monitor className="w-3.5 h-3.5" />
              </NavTab>
              <NavTab
                current={theme === 'dark'}
                onClick={() => setTheme('dark')}
                layoutId={`${themeTabId}-indicator`}
              >
                <Moon className="w-3.5 h-3.5" />
              </NavTab>
            </LayoutGroup>
          </div>

          <NavDivider />

          {/* AI toggle */}
          <PillButton
            variant="ai"
            active={rightPanelMode === 'ai'}
            onClick={() => setRightPanelMode(rightPanelMode === 'ai' ? 'inspector' : 'ai')}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="hidden sm:inline">AI</span>
          </PillButton>

          {/* Code toggle */}
          <PillButton
            active={showCode}
            onClick={() => setShowCode(!showCode)}
          >
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Code</span>
          </PillButton>

          <NavDivider />

          {/* Clear */}
          <IconButton onClick={clearCanvas} title="Clear canvas" danger>
            <Trash2 className="w-4 h-4" />
          </IconButton>

          {/* Export - Catalyst-style gradient solid button */}
          <PillButton variant="export">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </PillButton>

          <NavDivider />

          {/* Avatar */}
          <button
            className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-zinc-950"
            title="Account"
          >
            <Avatar initials="LC" />
          </button>
        </div>
      </div>
    </header>
  );
}
