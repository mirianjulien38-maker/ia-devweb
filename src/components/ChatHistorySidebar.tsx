import React from "react";
import { 
  Plus, MessageSquare, Trash2, Settings, History, 
  ChevronLeft, ChevronRight, Server, Sparkles, LogOut, Check,
  Coins, CreditCard, ArrowUpRight, HelpCircle, BookOpen, MessageCircle, Globe
} from "lucide-react";
import { WebSiteProject } from "../types";
import { Language, translations } from "../translations";

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
  user: {
    id: string;
    email: string;
    name: string;
    credits: number;
    tokensUsed: number;
    bonusClaimsCount: number;
    isAdmin: boolean;
  } | null;
  onOpenRecharge: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenFaq: () => void;
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
  onToggle,
  user,
  onOpenRecharge,
  language,
  onLanguageChange,
  onOpenFaq
}: ChatHistorySidebarProps) {
  const t = translations[language];

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
        title={isOpen ? t.collapseSidebar : t.expandSidebar}
      >
        {isOpen ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>

      {/* Language Selector Selector Row */}
      <div className="px-4 pt-4 shrink-0 flex items-center justify-between border-b border-slate-900/60 pb-3">
        <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
          <Globe className="w-3.5 h-3.5 text-sky-400" />
          <span>Fiteny / Langue / Lang</span>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(["mg", "fr", "en"] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => onLanguageChange(lang)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-all ${
                language === lang
                  ? "bg-sky-500 text-white shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4 shrink-0 pb-2">
        <button
          onClick={onNewProject}
          className="w-full flex items-center justify-between gap-2 bg-slate-900 hover:bg-slate-850 text-white border border-slate-800 hover:border-slate-700 text-xs font-bold py-3 px-4 rounded-xl transition-all active:scale-[0.98] shadow-lg group"
        >
          <div className="flex items-center gap-2">
            <Plus className="w-4 h-4 text-sky-400 group-hover:rotate-90 transition-transform" />
            <span>{t.newWebsite}</span>
          </div>
          <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[9px] text-slate-500 font-mono">⌘N</span>
        </button>
      </div>

      {/* User Balance & Recharge Promo Card */}
      {user && (
        <div className="px-4 pb-4 shrink-0">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/20 border border-slate-800/80 rounded-2xl p-4 shadow-xl">
            {/* Ambient background glows inside the card */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase font-bold tracking-wider font-sans">{t.creditsRemaining}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{t.activeStatus}</span>
              </div>

              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-sky-400 font-mono tracking-tight">{user.credits}</span>
                <span className="text-[10px] text-slate-400 font-medium font-sans">Credits</span>
              </div>

              {/* Purchase button with glowing gradient */}
              <button
                onClick={onOpenRecharge}
                className="w-full mt-1.5 py-2.5 px-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-sky-500/15 flex items-center justify-center gap-1.5 active:scale-[0.97] hover:shadow-sky-500/25 group cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5 text-sky-100 group-hover:scale-110 transition-transform" />
                <span>{t.buyCredits}</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-sky-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Discussion List Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-slate-800/80">
        <div className="space-y-1.5">
          <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-slate-500" />
              {language === "mg" ? "Ireo Resaka Teo Aloha" : language === "fr" ? "Discussions Précédentes" : "Previous Discussions"}
            </span>
            {projects.length > 0 && (
              <button
                onClick={() => {
                  const confirmMsg = language === "mg" 
                    ? "Tena hodiovinao tokoa ve ny tantaran'ny resaka rehetra?"
                    : language === "fr"
                    ? "Voulez-vous vraiment effacer tout l'historique des discussions ?"
                    : "Are you sure you want to clear all chat history?";
                  if (confirm(confirmMsg)) {
                    onClearHistory();
                  }
                }}
                className="text-[9px] text-slate-600 hover:text-rose-400 transition-colors"
                title={language === "mg" ? "Hamafa tantara rehetra" : language === "fr" ? "Vider l'historique" : "Clear all"}
              >
                {language === "mg" ? "Hafao rehetra" : language === "fr" ? "Effacer" : "Clear"}
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="px-3 py-6 text-center border border-dashed border-slate-950 bg-slate-950/20 rounded-2xl">
              <MessageSquare className="w-6 h-6 text-slate-800 mx-auto mb-1.5" />
              <p className="text-[11px] text-slate-600 italic">{t.noWebsitesYet}</p>
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
                      title={t.deleteProj}
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
        
        {/* Support WhatsApp Button */}
        <a
          href="https://wa.me/261382266876"
          target="_blank"
          referrerPolicy="no-referrer"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between gap-2.5 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-400 hover:text-emerald-300 border border-emerald-900/40 hover:border-emerald-700 text-xs font-bold p-2.5 rounded-xl transition-all cursor-pointer shadow-sm group"
        >
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
            <span>{t.support}</span>
          </div>
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </a>

        {/* FAQ & Documentation Button */}
        <button
          onClick={onOpenFaq}
          className="w-full flex items-center gap-2.5 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-850 cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-amber-500" />
          <span>{t.faqAndDocs}</span>
        </button>

        {/* Database Config Settings Button */}
        <button
          onClick={onOpenDatabaseSettings}
          className="w-full flex items-center gap-2.5 text-slate-400 hover:text-white hover:bg-slate-900 text-xs font-semibold p-2.5 rounded-xl transition-all border border-transparent hover:border-slate-850 cursor-pointer"
        >
          <Settings className="w-4 h-4 text-sky-400" />
          <span>Fikirakirana DB (Settings)</span>
        </button>

        {/* Brand signature */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-700">
          <span className="font-mono">DevWeb IA v3.0</span>
          <span className="flex items-center gap-0.5"><Sparkles className="w-2.5 h-2.5 text-sky-500" /> Professional Multi-Lang</span>
        </div>
      </div>

    </div>
  );
}
