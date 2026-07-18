import React, { useState, useEffect } from "react";
import { 
  X, Database, Check, ArrowRight, Server, AlertCircle, Plus, Info 
} from "lucide-react";
import { SavedDatabaseConfig } from "../types";

interface PromptDatabaseWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onSubmit: (dbChoice: {
    useDb: boolean;
    dbType?: "Firebase" | "Supabase";
    config?: SavedDatabaseConfig;
  }) => void;
}

export default function PromptDatabaseWizard({ 
  isOpen, 
  onClose, 
  onOpenSettings, 
  onSubmit 
}: PromptDatabaseWizardProps) {
  const [savedConfigs, setSavedConfigs] = useState<SavedDatabaseConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string>("none"); // "none" means static/local storage

  useEffect(() => {
    if (isOpen) {
      setSelectedId("none");
      // Load saved configurations from localStorage
      const saved = localStorage.getItem("devweb-ia-db-configs");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSavedConfigs(parsed);
          // If there is at least one config, pre-select the first one
          if (parsed.length > 0) {
            setSelectedId(parsed[0].id);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setSavedConfigs([]);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleContinue = () => {
    if (selectedId === "none") {
      onSubmit({ useDb: false });
    } else {
      const config = savedConfigs.find(c => c.id === selectedId);
      if (config) {
        onSubmit({
          useDb: true,
          dbType: config.type,
          config: config
        });
      } else {
        onSubmit({ useDb: false });
      }
    }
  };

  const handleAddDatabase = () => {
    onClose();
    onOpenSettings();
  };

  const hasSavedConfigs = savedConfigs.length > 0;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800/80 w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-sky-400" />
            <h4 className="text-white font-bold text-sm uppercase tracking-wide">
              {hasSavedConfigs ? "Safidio ny Database Hampiasaina" : "Mbola tsy misy Database!"}
            </h4>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 hover:bg-slate-800/85 rounded-lg transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Body */}
        <div className="p-6 flex-1 overflow-y-auto max-h-[400px] space-y-5">
          {hasSavedConfigs ? (
            /* CASE 1: Configs already registered/saved */
            <div className="space-y-4 animate-slideUp">
              <p className="text-slate-400 text-xs leading-relaxed">
                Misy base de données voatahiry efa hita ao amin'ny mombamomba anao. Misafidiana (cocher) iray tianao hampiasaina na fidio ny tsy hampiasa database:
              </p>

              <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                {savedConfigs.map((cfg) => {
                  const isSelected = selectedId === cfg.id;
                  return (
                    <button
                      key={cfg.id}
                      onClick={() => setSelectedId(cfg.id)}
                      className={`w-full p-3.5 rounded-2xl text-left transition-all border flex items-center justify-between ${
                        isSelected
                          ? "bg-sky-500/10 border-sky-500 shadow-md shadow-sky-500/5"
                          : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-lg text-[10px] font-extrabold ${
                          cfg.type === "Firebase" 
                            ? "bg-amber-500/10 text-amber-500" 
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {cfg.type === "Firebase" ? "Firebase" : "Supabase"}
                        </div>
                        <div>
                          <h6 className="text-white font-bold text-xs">{cfg.projectName}</h6>
                          <p className="text-slate-500 text-[9px] mt-0.5 font-mono truncate max-w-[180px]">
                            {cfg.type === "Supabase" ? cfg.config.url : cfg.config.projectId}
                          </p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                        isSelected 
                          ? "border-sky-500 bg-sky-500 text-white" 
                          : "border-slate-700 bg-slate-900"
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                  );
                })}

                {/* Option to NOT use a database (Static / Local Storage fotsiny) */}
                <button
                  onClick={() => setSelectedId("none")}
                  className={`w-full p-3.5 rounded-2xl text-left transition-all border flex items-center justify-between ${
                    selectedId === "none"
                      ? "bg-slate-800 border-slate-700 shadow-md"
                      : "bg-slate-950/40 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 border border-slate-700 text-slate-400 p-1.5 rounded-lg text-[10px] font-bold">
                      Local
                    </div>
                    <div>
                      <h6 className="text-slate-300 font-bold text-xs">Tsy hampiasa base de données</h6>
                      <p className="text-slate-500 text-[9px] mt-0.5">
                        Mampiasa Local Storage na ho static fotsiny ny tranonkala.
                      </p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${
                    selectedId === "none"
                      ? "border-slate-400 bg-slate-400 text-slate-950"
                      : "border-slate-700 bg-slate-900"
                  }`}>
                    {selectedId === "none" && <Check className="w-3.5 h-3.5" />}
                  </div>
                </button>
              </div>

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full py-3.5 mt-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-500/10 active:scale-95"
              >
                <span>Tohizana sy hamoaka kaody</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* CASE 2: No configs registered yet */
            <div className="space-y-5 text-center animate-slideUp">
              <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/5">
                <AlertCircle className="w-7 h-7" />
              </div>
              
              <div className="space-y-1.5">
                <h5 className="text-white font-extrabold text-sm leading-snug">Mila mampiditra Database ve ianao?</h5>
                <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto">
                  Mba ahafahan'ny IA mampifandray mivantana ny tranonkalanao amin'ny database (Firebase/Supabase), ampidiro aloha ny fikirakirana.
                </p>
              </div>

              <div className="grid gap-2.5 pt-2">
                {/* Redirect Option */}
                <button
                  onClick={handleAddDatabase}
                  className="w-full p-4 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-lg hover:shadow-sky-500/20 active:scale-[0.99] flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Hampiditra (Configure Database)</span>
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Continue Offline Option */}
                <button
                  onClick={() => onSubmit({ useDb: false })}
                  className="w-full p-4 rounded-2xl bg-slate-950/50 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-200 font-bold text-xs transition-all active:scale-[0.99] flex items-center justify-center gap-2"
                >
                  <span>Aoka ihany (Mampiasa Local Storage)</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
