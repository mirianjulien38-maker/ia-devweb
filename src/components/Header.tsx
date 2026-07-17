import React from "react";
import { Sparkles, Code2, Layers, Database, Coins, ShieldCheck, LogOut } from "lucide-react";
import { Language, translations } from "../translations";

interface HeaderProps {
  currentProjectName: string;
  isGenerating: boolean;
  onNewProject: () => void;
  onOpenDatabaseWizard?: () => void;
  user: {
    id: string;
    email: string;
    name: string;
    credits: number;
    tokensUsed: number;
    isAdmin: boolean;
  } | null;
  onOpenRecharge: () => void;
  onOpenAdmin: () => void;
  onLogout: () => void;
  language: Language;
}

export default function Header({ 
  currentProjectName, 
  isGenerating, 
  onNewProject,
  onOpenDatabaseWizard,
  user,
  onOpenRecharge,
  onOpenAdmin,
  onLogout,
  language
}: HeaderProps) {
  const t = translations[language];

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 shrink-0 shadow-lg">
      
      {/* Left side: Brand Logo & Slogan */}
      <div className="flex items-center gap-3">
        <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center">
          <Code2 className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-sans font-extrabold text-2xl tracking-tight text-white uppercase bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
              {t.brandTitle}
            </h1>
            <span className="bg-sky-500/10 text-sky-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-500/20 uppercase tracking-widest">
              {t.badgePro}
            </span>
          </div>
          <p className="text-slate-400 text-xs mt-0.5 font-sans font-medium">
            {t.brandSlogan}
          </p>
        </div>
      </div>

      {/* Right side: User status, credits, admin button, action triggers */}
      <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
        {user && (
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/60 border border-slate-800/80 p-1.5 rounded-2xl">
            
            {/* User name & email info */}
            <div className="px-2.5 py-1 text-left hidden sm:block">
              <div className="text-xs font-bold text-slate-200 leading-none">{user.name}</div>
              <div className="text-[9px] font-mono text-slate-500 mt-0.5">{user.email}</div>
            </div>

            {/* Credit balance display (clicking recharges) */}
            <button
              onClick={onOpenRecharge}
              className="flex items-center gap-1.5 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 text-sky-400 hover:text-sky-300 transition-all py-1.5 px-3.5 rounded-xl text-xs font-bold font-mono active:scale-95 cursor-pointer"
              title={t.buyCredits}
            >
              <Coins className="w-4 h-4" />
              <span>{user.credits} {t.credits}</span>
              <span className="bg-sky-500 text-white font-black rounded-full w-4 h-4 flex items-center justify-center text-[10px] ml-0.5">+</span>
            </button>

            {/* Admin Dashboard shortcut button (only for horlandobe@gmail.com) */}
            {user.isAdmin && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400 hover:text-indigo-300 transition-all py-1.5 px-3 rounded-xl text-xs font-bold active:scale-95 cursor-pointer"
                title={t.adminPanel}
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden lg:inline">{t.adminPanel}</span>
              </button>
            )}

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>

          </div>
        )}

        {currentProjectName && (
          <div className="hidden lg:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/50 text-slate-300 text-xs font-mono max-w-[150px] truncate">
            <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <span className="truncate">{currentProjectName}</span>
          </div>
        )}

        {onOpenDatabaseWizard && (
          <button
            onClick={onOpenDatabaseWizard}
            className="flex items-center gap-2 bg-slate-800/95 hover:bg-slate-850 text-sky-400 hover:text-sky-300 border border-slate-700 hover:border-sky-500/30 transition-all px-4 py-2 rounded-xl text-sm font-semibold active:scale-95"
            title={t.databaseWizard}
          >
            <Database className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">{t.databaseWizard}</span>
          </button>
        )}

        <button
          onClick={onNewProject}
          disabled={isGenerating}
          className="flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all px-4 py-2 rounded-xl text-sm font-semibold shadow-md active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>{t.newWebsite}</span>
        </button>
      </div>
    </header>
  );
}
