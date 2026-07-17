import React, { useState, useEffect } from "react";
import { 
  X, Database, HelpCircle, Check, ArrowRight, ArrowLeft, 
  Sparkles, ShieldCheck, Server, AlertCircle, Plus, Info
} from "lucide-react";
import { SavedDatabaseConfig } from "../types";

interface PromptDatabaseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (dbChoice: {
    useDb: boolean;
    dbType?: "Firebase" | "Supabase";
    config?: SavedDatabaseConfig;
  }) => void;
}

export default function PromptDatabaseWizard({ isOpen, onClose, onSubmit }: PromptDatabaseWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [useDb, setUseDb] = useState<boolean | null>(null);
  const [dbType, setDbType] = useState<"Firebase" | "Supabase" | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<SavedDatabaseConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string>("");

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setUseDb(null);
      setDbType(null);
      setSelectedConfigId("");
      
      // Load saved configurations
      const saved = localStorage.getItem("devweb-ia-db-configs");
      if (saved) {
        try {
          setSavedConfigs(JSON.parse(saved));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter configs based on selected db type
  const filteredConfigs = savedConfigs.filter(c => c.type === dbType);

  const handleStep1 = (choice: boolean) => {
    setUseDb(choice);
    if (!choice) {
      // If "no database", directly submit
      onSubmit({ useDb: false });
    } else {
      setStep(2);
    }
  };

  const handleStep2 = (type: "Firebase" | "Supabase") => {
    setDbType(type);
    setStep(3);
  };

  const handleStep3Submit = () => {
    if (!selectedConfigId) {
      alert("Azafady, misafidiana tetikasa database iray na ampidiro ao amin'ny Parameters aloha!");
      return;
    }
    const config = savedConfigs.find(c => c.id === selectedConfigId);
    onSubmit({
      useDb: true,
      dbType: dbType || undefined,
      config: config
    });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h4 className="text-white font-bold text-sm uppercase tracking-wide">Safidy Database</h4>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800/85 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6">
          
          {/* STEP 1: Use Database or Not */}
          {step === 1 && (
            <div className="space-y-5 animate-slideUp">
              <div className="text-center space-y-2">
                <HelpCircle className="w-12 h-12 text-sky-400 mx-auto mb-1 animate-pulse" />
                <h5 className="text-white font-bold text-base leading-tight">Hampiasa Database ve ianao?</h5>
                <p className="text-slate-400 text-xs leading-relaxed max-w-xs mx-auto">
                  Te hampiasa base de données Firebase na Supabase ve ianao mba hitahirizana ny angon-drakitry ny mpitsidika?
                </p>
              </div>

              <div className="grid gap-3 pt-2">
                <button
                  onClick={() => handleStep1(true)}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/30 hover:border-sky-500 text-left transition-all hover:scale-[1.01] active:scale-[0.99] group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h6 className="text-white font-bold text-xs">Eny, hampiasa Database aho</h6>
                      <p className="text-slate-400 text-[10px] mt-1 font-sans">
                        Mety amin'ny fitahirizana hafatra, fidirana, na fivarotana vokatra.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-sky-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>

                <button
                  onClick={() => handleStep1(false)}
                  className="w-full p-4 rounded-2xl bg-slate-950/40 border border-slate-850 hover:border-slate-700 text-left transition-all hover:scale-[1.01] active:scale-[0.99] group"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h6 className="text-slate-300 font-bold text-xs">Tsy mila (Static fotsiny)</h6>
                      <p className="text-slate-500 text-[10px] mt-1 font-sans">
                        Tsy mila fitehirizana data maharitra, na mampiasa Local Storage fotsiny.
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Choose Firebase or Supabase */}
          {step === 2 && (
            <div className="space-y-5 animate-slideUp">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-sans">
                <button onClick={() => setStep(1)} className="hover:text-white flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Miverina
                </button>
              </div>

              <div className="text-center space-y-1.5">
                <h5 className="text-white font-bold text-base">Inona no Database hampiasaina?</h5>
                <p className="text-slate-400 text-xs">Fidio ny rafitra tianao hampifandraisina amin'ny tetikasa</p>
              </div>

              <div className="grid gap-3 pt-2">
                <button
                  onClick={() => handleStep2("Supabase")}
                  className="w-full p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 hover:border-emerald-500 text-left transition-all hover:scale-[1.01] active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="text-emerald-400 font-extrabold text-xs">Supabase (PostgreSQL)</h6>
                      <p className="text-slate-400 text-[10px] mt-1 font-sans">Mora ampiasaina amin'ny alàlan'ny SQL sy API tsotra.</p>
                    </div>
                    <div className="bg-emerald-500/10 text-emerald-400 p-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleStep2("Firebase")}
                  className="w-full p-4 rounded-2xl bg-amber-500/5 border border-amber-500/20 hover:border-amber-500 text-left transition-all hover:scale-[1.01] active:scale-[0.99] group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h6 className="text-amber-500 font-extrabold text-xs">Google Firebase</h6>
                      <p className="text-slate-400 text-[10px] mt-1 font-sans">Mety indrindra amin'ny Realtime Database sy Authentications.</p>
                    </div>
                    <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-lg">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Choose Stored Project Name */}
          {step === 3 && (
            <div className="space-y-4 animate-slideUp">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-sans">
                <button onClick={() => setStep(2)} className="hover:text-white flex items-center gap-1 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Miverina
                </button>
              </div>

              <div>
                <h5 className="text-white font-bold text-base">Misafidiana Tetikasa {dbType}</h5>
                <p className="text-slate-400 text-xs mt-1">Safidio ny fikirakirana voatahiry hampiasain'ny IA</p>
              </div>

              {filteredConfigs.length === 0 ? (
                <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-850 space-y-3.5">
                  <div className="flex gap-2.5 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h6 className="text-white font-bold text-xs">Tsy misy fikirakirana voatahiry</h6>
                      <p className="text-slate-400 text-[11px] leading-relaxed mt-1">
                        Mba hampiasana ny database {dbType}, tsindrio aloha ny <strong>Parameters (Settings)</strong> eo amin'ny farany ambony amin'ny sidebar ary ampidiro ny credentials-nao.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Ny Tetikasanao:</label>
                    <select
                      value={selectedConfigId}
                      onChange={(e) => setSelectedConfigId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    >
                      <option value="">-- Safidio ny tetikasa database --</option>
                      {filteredConfigs.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.projectName} ({c.type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-sky-500/10 border border-sky-500/20 rounded-xl p-3.5 flex gap-2.5 items-start">
                    <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                    <p className="text-slate-300 text-[10px] leading-normal font-sans">
                      Ny IA dia hampiasa ity fikirakirana ity hamoronana mivantana ny tranonkala mifandray amin'ny {dbType}-nao. Voatahiry voaro ao amin'ny fitaovanao ny tsiambaratelo.
                    </p>
                  </div>

                  <button
                    onClick={handleStep3Submit}
                    disabled={!selectedConfigId}
                    className={`w-full py-3 rounded-xl text-white font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                      selectedConfigId 
                        ? "bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 shadow-lg active:scale-95" 
                        : "bg-slate-800 text-slate-500 cursor-not-allowed"
                    }`}
                  >
                    <Sparkles className="w-4 h-4" />
                    Manomboka manoratra kaody mivantana
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
