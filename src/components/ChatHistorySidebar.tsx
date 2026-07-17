import React from "react";
import { 
  Plus, MessageSquare, Trash2, Settings, History, 
  ChevronLeft, ChevronRight, Server, Sparkles, LogOut, Check
} from "lucide-react";
import { WebSiteProject } from "../types";

interface ChatHistorySidebarProps {
  projects: WebSiteProject[];
  currentProjectId?: string;
  onSelectProject: (proj: WebSiteProject) => void;
  onDeleteProject: (projId: string, e: React.MouseEvent) => void;
  onNewProject: () => void;
  onOpenDatabaseSettings: () => void;
  onClearHistory: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ChatHistorySidebar({
  projects,
  currentProjectId,
  onSelectProject,
  onDeleteProject,
  onNewProject,
  onOpenDatabaseSettings,
  onClearHistory,
  isOpen,
  onToggle
}: ChatHistorySidebarProps) {
  return (
    <div 
      className={`bg-[#0b0c0f] border-r border-slate-900 h-full flex flex-col transition-all duration-300 relative ${
        isOpen ? "w-[280px]" : "w-0 overflow-hidden border-r-0"
      }`}
    >
      {/* Toggle collapse button (floating on edge) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white p-1 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 hidden lg:block"
        title={isOpen ? "Afeno ny sidebar" : "Asehoy ny sidebar"}
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* New Chat Button */}
      <div className="p-4 shrink-0">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 text-xs font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400 group-hover:rotate-90 transition-transform" />
            <span>Tantara Vaovao (New Chat)</span>
          </div>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-500 font-mono">⌘N</span>
        </button>
      </div>

      {/* Discussion List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              Ireo Resaka Teo Aloha
            </span>
            {projects.length > 0 && (
              <button
                onClick={() => {
                  if (confirm("Tena hodiovinao tokoa ve ny tantaran'ny resaka rehetra?")) {
                    onClearHistory();
                  }
                }}
                className="text-[9px] text-slate-600 hover:text-rose-400 transition-colors"
                title="Hamafa tantara rehetra"
              >
                Hafao rehetra
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="px-3 py-6 text-center border border-dashed border-slate-950 bg-slate-950/20 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-slate-800 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-600 italic">Tsy misy resaka taloha voatahiry.</p>
            </div>
          ) : (
            <div className="space-y-1">
              {projects.map((proj) => {
                const isActive = currentProjectId === proj.id;
                return (
                  <div
                    key={proj.id}
                    onClick={() => onSelectProject(proj)}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                      isActive
                        ? "bg-slate-900 border border-slate-800 text-white font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-sky-400" : "text-slate-600 group-hover:text-slate-400"}`} />
                      <span className="truncate leading-normal">{proj.name}</span>
                    </div>
                    
                    <button
                      onClick={(e) => onDeleteProject(proj.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-slate-800 transition-all shrink-0 ml-1"
                      title="Fafao"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Settings & Configuration Bottom Panel */}
      <div className="p-4 border-t border-slate-900/80 bg-[#08090b] space-y-2 shrink-0">
        
        {/* Database Quick Status */}
        <div className="flex items-center justify-between p-2.5 bg-slate-950/60 rounded-xl border border-slate-900 text-[10px]">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Server className="w-3.5 h-3.5 text-sky-500/80" />
            <span>Database Status:</span>
          </div>
          <span className="text-emerald-400 font-bold flex items-center gap-1 font-sans">
            Ready <Check className="w-3 h-3" />
          </span>
        </div>

        {/* Database Config Settings Button */}
        <button
          onClick={onOpenDatabaseSettings}
          className="w-full flex items-center gap-2.5 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-850"
        >
          <Settings className="w-4 h-4 text-sky-400" />
          <span>Fikirakirana DB (Settings)</span>
        </button>

        {/* Brand signature */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-700">
          <span className="font-mono">DevWeb IA v2.5</span>
          <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5 text-sky-500" /> Chat GPT Layout</span>
        </div>
      </div>

    </div>
  );
}
