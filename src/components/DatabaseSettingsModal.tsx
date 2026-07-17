import React, { useState, useEffect } from "react";
import { 
  X, Database, Shield, ShieldCheck, Key, Info, HelpCircle, 
  Trash2, Plus, Check, ExternalLink, Settings, Eye, EyeOff, Sparkles, Server
} from "lucide-react";
import { SavedDatabaseConfig } from "../types";

interface DatabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigsChange?: (configs: SavedDatabaseConfig[]) => void;
}

export default function DatabaseSettingsModal({ isOpen, onClose, onConfigsChange }: DatabaseSettingsModalProps) {
  const [configs, setConfigs] = useState<SavedDatabaseConfig[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [dbType, setDbType] = useState<"Firebase" | "Supabase">("Supabase");
  const [projectName, setProjectName] = useState("");
  
  // Supabase Fields
  const [sbUrl, setSbUrl] = useState("");
  const [sbAnonKey, setSbAnonKey] = useState("");

  // Firebase Fields
  const [fbApiKey, setFbApiKey] = useState("");
  const [fbAuthDomain, setFbAuthDomain] = useState("");
  const [fbProjectId, setFbProjectId] = useState("");
  const [fbStorageBucket, setFbStorageBucket] = useState("");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState("");
  const [fbAppId, setFbAppId] = useState("");

  // Visibility states
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("devweb-ia-db-configs");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setConfigs(parsed);
      } catch (e) {
        console.error(e);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const saveConfigs = (newConfigs: SavedDatabaseConfig[]) => {
    localStorage.setItem("devweb-ia-db-configs", JSON.stringify(newConfigs));
    setConfigs(newConfigs);
    if (onConfigsChange) {
      onConfigsChange(newConfigs);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      alert("Manorata anarana ho an'ny tetikasa azafady!");
      return;
    }

    const newConfig: SavedDatabaseConfig = {
      id: `db-${Date.now()}`,
      projectName: projectName.trim(),
      type: dbType,
      config: dbType === "Supabase" ? {
        url: sbUrl.trim(),
        anonKey: sbAnonKey.trim(),
      } : {
        apiKey: fbApiKey.trim(),
        authDomain: fbAuthDomain.trim(),
        projectId: fbProjectId.trim(),
        storageBucket: fbStorageBucket.trim(),
        messagingSenderId: fbMessagingSenderId.trim(),
        appId: fbAppId.trim(),
      },
      createdAt: new Date().toLocaleString()
    };

    const updated = [...configs, newConfig];
    saveConfigs(updated);

    // Reset Form
    setProjectName("");
    setSbUrl("");
    setSbAnonKey("");
    setFbApiKey("");
    setFbAuthDomain("");
    setFbProjectId("");
    setFbStorageBucket("");
    setFbMessagingSenderId("");
    setFbAppId("");
    setIsAdding(false);
  };

  const handleDeleteConfig = (id: string) => {
    if (confirm("Tena hovafanao ve ity fikirakirana ity?")) {
      const updated = configs.filter(c => c.id !== id);
      saveConfigs(updated);
    }
  };

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800/80 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/85 bg-slate-900/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/20">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-none">Fikirakirana Database</h3>
              <p className="text-slate-400 text-xs mt-1.5 font-sans">
                Tantano ary ampidiro manokana ny database (Supabase na Firebase) ampiasain'ny IA
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 hover:bg-slate-800/80 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {!isAdding ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <Database className="w-4 h-4 text-sky-400" />
                  Ireo fikirakirana voatahiry ({configs.length})
                </h4>
                <button
                  onClick={() => setIsAdding(true)}
                  className="bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Ampidiro vaovao
                </button>
              </div>

              {configs.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                  <Server className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-slate-400 text-xs font-sans">Mbola tsy nisy fikirakirana database voatahiry.</p>
                  <p className="text-slate-500 text-[11px] mt-1 font-sans">Tsindrio ny "Ampidiro vaovao" mba hanampiana iray.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {configs.map((c) => (
                    <div 
                      key={c.id}
                      className="p-4 bg-slate-950/40 border border-slate-850 rounded-2xl flex items-center justify-between hover:border-slate-700/60 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-xs font-bold uppercase ${
                          c.type === "Firebase" 
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" 
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          {c.type === "Firebase" ? "FB" : "SB"}
                        </div>
                        <div>
                          <h5 className="text-white text-sm font-bold leading-none">{c.projectName}</h5>
                          <p className="text-slate-500 text-[11px] mt-1 font-mono">
                            {c.type} • {c.type === "Supabase" ? c.config.url : c.config.projectId}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeleteConfig(c.id)}
                        className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all"
                        title="Fafao ity config ity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* ADD NEW CONFIGURATION FORM */
            <form onSubmit={handleSaveConfig} className="space-y-5 animate-fadeIn">
              <div className="flex justify-between items-center">
                <h4 className="text-white text-sm font-bold">Ampidiro fikirakirana Database vaovao</h4>
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="text-slate-400 hover:text-white text-xs bg-slate-800 px-3 py-1.5 rounded-lg transition-all"
                >
                  Hanafoana
                </button>
              </div>

              {/* 1. Database Type */}
              <div className="space-y-1.5">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">1. Misafidiana Database</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setDbType("Supabase")}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                      dbType === "Supabase"
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <span>Supabase (PostgreSQL)</span>
                    {dbType === "Supabase" && <Check className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDbType("Firebase")}
                    className={`p-3.5 rounded-xl border text-left flex items-center justify-between font-bold text-xs transition-all ${
                      dbType === "Firebase"
                        ? "bg-amber-500/10 border-amber-500 text-amber-500"
                        : "bg-slate-950/60 border-slate-850 text-slate-400 hover:bg-slate-900"
                    }`}
                  >
                    <span>Google Firebase</span>
                    {dbType === "Firebase" && <Check className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2. Project Name */}
              <div className="space-y-1">
                <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">2. Anaran'ny Tetikasa (Project Name)</label>
                <input
                  type="text"
                  required
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Ohatra: Tranonkala Fivarotana na GastroArt DB"
                  className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                />
                <p className="text-[10px] text-slate-500 italic">Ity anarana ity no hanontanian'ny IA anao rehefa hamorona site hampiasana base de données.</p>
              </div>

              {/* 3. Credentials based on type */}
              <div className="border-t border-slate-800/80 pt-4 space-y-4">
                <label className="text-slate-300 text-xs font-bold flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-sky-400" />
                  3. Atsofohy ny Credentials rehetra ilaina
                </label>

                {dbType === "Supabase" ? (
                  <div className="space-y-4">
                    {/* Supabase URL */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">VITE_SUPABASE_URL</label>
                        <span className="text-[10px] text-sky-400/80 flex items-center gap-0.5">
                          <Info className="w-3 h-3" /> Hita ao amin'ny Settings &gt; API
                        </span>
                      </div>
                      <input
                        type="url"
                        required
                        value={sbUrl}
                        onChange={(e) => setSbUrl(e.target.value)}
                        placeholder="https://your-project.supabase.co"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-normal bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Sokafy ny dashboard-nao ao amin'ny <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">supabase.com</a>, mandehana any amin'ny <strong>Project Settings &gt; API</strong>, ary adika ny <strong>Project URL</strong>.
                      </p>
                    </div>

                    {/* Supabase Anon Key */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">VITE_SUPABASE_ANON_KEY</label>
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility("sb_anon")}
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[10px]"
                        >
                          {showKeys["sb_anon"] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showKeys["sb_anon"] ? "Afeno" : "Asehoy"}</span>
                        </button>
                      </div>
                      <input
                        type={showKeys["sb_anon"] ? "text" : "password"}
                        required
                        value={sbAnonKey}
                        onChange={(e) => setSbAnonKey(e.target.value)}
                        placeholder="your-anon-public-key"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-normal bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Hita ao amin'ny <strong>Project Settings &gt; API</strong> ao amin'ny fizarana <strong>Project API keys</strong>. Adikao ilay misy soratra hoe <code className="text-emerald-400">anon</code> sy <code className="text-emerald-400">public</code>.
                      </p>
                    </div>
                  </div>
                ) : (
                  /* FIREBASE CREDENTIALS WITH INDIVIDUAL GUIDES */
                  <div className="space-y-4">
                    {/* Firebase API Key */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">VITE_FIREBASE_API_KEY</label>
                        <button
                          type="button"
                          onClick={() => toggleKeyVisibility("fb_key")}
                          className="text-slate-500 hover:text-slate-300 flex items-center gap-1 text-[10px]"
                        >
                          {showKeys["fb_key"] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          <span>{showKeys["fb_key"] ? "Afeno" : "Asehoy"}</span>
                        </button>
                      </div>
                      <input
                        type={showKeys["fb_key"] ? "text" : "password"}
                        required
                        value={fbApiKey}
                        onChange={(e) => setFbApiKey(e.target.value)}
                        placeholder="AIzaSyA..."
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Sokafy ny <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="text-sky-400 hover:underline">firebase console</a>, mandehana ao amin'ny <strong>Project Settings &gt; General</strong>, ao amin'ny fizarana "Your apps" dia ahitanao ilay snippet misy <code className="text-amber-400">apiKey</code>.
                      </p>
                    </div>

                    {/* Firebase Auth Domain */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">VITE_FIREBASE_AUTH_DOMAIN</label>
                      <input
                        type="text"
                        required
                        value={fbAuthDomain}
                        onChange={(e) => setFbAuthDomain(e.target.value)}
                        placeholder="your-project-id.firebaseapp.com"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Fikirakirana fandraisana anarana, matetika miendrika <code className="text-amber-400">[project-id].firebaseapp.com</code>.
                      </p>
                    </div>

                    {/* Firebase Project ID */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">VITE_FIREBASE_PROJECT_ID</label>
                      <input
                        type="text"
                        required
                        value={fbProjectId}
                        onChange={(e) => setFbProjectId(e.target.value)}
                        placeholder="your-project-id"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Ny anarana tokana (ID) an'ny tetikasa Firebase anao ao amin'ny Console.
                      </p>
                    </div>

                    {/* Firebase Storage Bucket */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">VITE_FIREBASE_STORAGE_BUCKET</label>
                      <input
                        type="text"
                        value={fbStorageBucket}
                        onChange={(e) => setFbStorageBucket(e.target.value)}
                        placeholder="your-project-id.appspot.com"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Toerana fitehirizana rakitra, miendrika <code className="text-amber-400">[project-id].appspot.com</code>.
                      </p>
                    </div>

                    {/* Firebase Messaging Sender ID */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">VITE_FIREBASE_MESSAGING_SENDER_ID</label>
                      <input
                        type="text"
                        value={fbMessagingSenderId}
                        onChange={(e) => setFbMessagingSenderId(e.target.value)}
                        placeholder="1234567890"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                    </div>

                    {/* Firebase App ID */}
                    <div className="space-y-1">
                      <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">VITE_FIREBASE_APP_ID</label>
                      <input
                        type="text"
                        required
                        value={fbAppId}
                        onChange={(e) => setFbAppId(e.target.value)}
                        placeholder="1:1234567890:web:abcdef12345"
                        className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                      />
                      <p className="text-[10px] text-slate-500 leading-relaxed bg-slate-950/30 p-2 rounded-lg font-sans border border-slate-850/60">
                        <strong>Toro-lalana:</strong> Ny ID an'ny web app-nao ao amin'ny Firebase setup.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-lg active:scale-95"
              >
                Tehirizo (Enregistrer)
              </button>
            </form>
          )}

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800/85 bg-slate-950/40 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95"
          >
            Hidio ny Varavarana
          </button>
        </div>

      </div>
    </div>
  );
}
