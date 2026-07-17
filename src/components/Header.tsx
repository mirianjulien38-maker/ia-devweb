import React from "react";
import { Sparkles, Code2, RefreshCw, Layers, Database } from "lucide-react";

interface HeaderProps {
  currentProjectName: string;
  isGenerating: boolean;
  onNewProject: () => void;
  onOpenDatabaseWizard?: () => void;
}

export default function Header({ 
  currentProjectName, 
  isGenerating, 
  onNewProject,
  onOpenDatabaseWizard 
}: HeaderProps) {
  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0 shadow-lg">
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-extrabold text-2xl tracking-tight text-white uppercase bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              DevWeb <span className="text-sky-400">IA</span>
            </h1>
            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20 uppercase tracking-widest">
              Mpanorina Pro
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 font-sans font-medium">
            Mpamorona Tranonkala Matihanina miaraka amin'ny AI sy Preview Mivantana
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
        {currentProjectName && (
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-300 text-xs font-mono max-w-xs truncate">
            <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{currentProjectName}</span>
          </div>
        )}

        {onOpenDatabaseWizard && (
          <button
            onClick={onOpenDatabaseWizard}
            className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-850 text-sky-400 hover:text-sky-300 border border-slate-700 hover:border-sky-500/30 transition-all px-4 py-2 rounded-xl text-sm font-semibold active:scale-95"
            title="Configure Database"
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Database Wizard</span>
          </button>
        )}

        <button
          onClick={onNewProject}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 py-2 rounded-xl text-sm font-semibold shadow-md active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Tranonkala Vaovao</span>
        </button>
      </div>
    </header>
  );
}
