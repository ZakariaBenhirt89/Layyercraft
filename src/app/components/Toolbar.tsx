import { useEffect, useState } from 'react';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code, 
  Trash2, 
  Download,
  Sun,
  Moon,
  MessageSquare
} from 'lucide-react';

type ToolbarProps = {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  showCode: boolean;
  setShowCode: (show: boolean) => void;
  clearCanvas: () => void;
  rightPanelMode: 'inspector' | 'ai';
  setRightPanelMode: (mode: 'inspector' | 'ai') => void;
};

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

  useEffect(() => {
    const stored = window.localStorage.getItem('theme');
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem('theme', theme);
    const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const resolved = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme;
    document.documentElement.classList.toggle('dark', resolved === 'dark');
  }, [theme]);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 dark:bg-slate-950 dark:border-slate-800">
      <div className="flex items-center justify-between">
        {/* Left - Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center dark:bg-slate-900 dark:border-slate-800">
            <img src="/logo/logowhite.svg" alt="Layercraft logo" className="h-7 w-7 block dark:hidden" />
            <img src="/logo/logodark.svg" alt="Layercraft logo" className="h-7 w-7 hidden dark:block" />
          </div>
          <div>
            <h1 className="text-xl text-slate-900 dark:text-slate-100">Layercraft</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">Drag & Drop UI Designer</p>
          </div>
        </div>

        {/* Center - View Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg dark:bg-slate-900">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'desktop'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'tablet'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="text-sm">Tablet</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'mobile'
                ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">Mobile</span>
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg dark:bg-slate-900">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                theme === 'light'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Light theme"
            >
              <Sun className="w-4 h-4" />
              <span className="text-xs">Light</span>
            </button>
            <button
              onClick={() => setTheme('system')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                theme === 'system'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="System theme"
            >
              <Monitor className="w-4 h-4" />
              <span className="text-xs">System</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                theme === 'dark'
                  ? 'bg-white text-blue-600 shadow-sm dark:bg-slate-800'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
              title="Dark theme"
            >
              <Moon className="w-4 h-4" />
              <span className="text-xs">Dark</span>
            </button>
          </div>
          <button
            onClick={() => setRightPanelMode(rightPanelMode === 'ai' ? 'inspector' : 'ai')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              rightPanelMode === 'ai'
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span className="text-sm">AI</span>
          </button>
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showCode
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="text-sm">Code</span>
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-red-950/40"
          >
            <Trash2 className="w-4 h-4" />
            <span className="text-sm">Clear</span>
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm">Export</span>
          </button>
        </div>
      </div>
    </header>
  );
}
