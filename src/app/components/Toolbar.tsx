import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Code, 
  Trash2, 
  Download
} from 'lucide-react';

type ToolbarProps = {
  viewMode: 'desktop' | 'tablet' | 'mobile';
  setViewMode: (mode: 'desktop' | 'tablet' | 'mobile') => void;
  showCode: boolean;
  setShowCode: (show: boolean) => void;
  clearCanvas: () => void;
};

export function Toolbar({ viewMode, setViewMode, showCode, setShowCode, clearCanvas }: ToolbarProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left - Brand */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center">
            <img src="/logo/logo.svg" alt="Layercraft logo" className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl">Layercraft</h1>
            <p className="text-xs text-slate-500">Drag & Drop UI Designer</p>
          </div>
        </div>

        {/* Center - View Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('desktop')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'desktop'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            <span className="text-sm">Desktop</span>
          </button>
          <button
            onClick={() => setViewMode('tablet')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'tablet'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Tablet className="w-4 h-4" />
            <span className="text-sm">Tablet</span>
          </button>
          <button
            onClick={() => setViewMode('mobile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              viewMode === 'mobile'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span className="text-sm">Mobile</span>
          </button>
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCode(!showCode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showCode
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Code className="w-4 h-4" />
            <span className="text-sm">Code</span>
          </button>
          <button
            onClick={clearCanvas}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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
