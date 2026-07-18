import React, { useState, useRef, useEffect } from "react";
import { 
  Send, Sparkles, HelpCircle, User, Utensils, 
  Briefcase, ShoppingBag, BookOpen, Trash2, 
  MessageSquare, Settings, Play, CheckCircle2, Download,
  ChevronRight, ChevronLeft, Database, Check, Plus, Info, Server, ShieldCheck, Eye, RefreshCw
} from "lucide-react";
import { PredefinedTemplate, ChatMessage, SavedDatabaseConfig } from "../types";
import { PREDEFINED_TEMPLATES } from "../data";
import PromptDatabaseWizard from "./PromptDatabaseWizard";

interface ChatWorkspaceProps {
  onGenerate: (prompt: string, refine: boolean) => void;
  isGenerating: boolean;
  hasExistingCode: boolean;
  chatHistory: ChatMessage[];
  onClearHistory: () => void;
  onSelectCode?: (code: string, text: string) => void;
  projectName: string;
  onOpenDatabaseSettings: () => void;
}

const getTemplateIcon = (iconName: string) => {
  switch (iconName) {
    case "User":
      return <User className="w-4 h-4 text-sky-400" />;
    case "Utensils":
      return <Utensils className="w-4 h-4 text-emerald-400" />;
    case "Briefcase":
      return <Briefcase className="w-4 h-4 text-amber-400" />;
    case "ShoppingBag":
      return <ShoppingBag className="w-4 h-4 text-rose-400" />;
    case "BookOpen":
      return <BookOpen className="w-4 h-4 text-violet-400" />;
    default:
      return <Sparkles className="w-4 h-4 text-sky-400" />;
  }
};

export default function ChatWorkspace({
  onGenerate,
  isGenerating,
  hasExistingCode,
  chatHistory,
  onClearHistory,
  onSelectCode,
  projectName,
  onOpenDatabaseSettings
}: ChatWorkspaceProps) {
  const [prompt, setPrompt] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Database Wizard interception states
  const [showPromptWizard, setShowPromptWizard] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState("");
  const [isRefinement, setIsRefinement] = useState(false);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, isGenerating]);

  // Listen to devweb-db-saved to resume generation automatically after user registers a database
  useEffect(() => {
    const handleDbSaved = (e: Event) => {
      const customEvent = e as CustomEvent<SavedDatabaseConfig>;
      const newConfig = customEvent.detail;
      if (pendingPrompt) {
        console.log("[DEVWEB] Database configured, automatically resuming generation with:", newConfig);
        handleWizardSubmit({
          useDb: true,
          dbType: newConfig.type,
          config: newConfig
        });
      }
    };
    window.addEventListener("devweb-db-saved", handleDbSaved);
    return () => {
      window.removeEventListener("devweb-db-saved", handleDbSaved);
    };
  }, [pendingPrompt, isRefinement]);

  // Intercept normal prompt submission to ask database questions first!
  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;
    
    // If it's a modification/refinement prompt, we can proceed directly or ask
    if (hasExistingCode) {
      onGenerate(prompt, true);
      setPrompt("");
    } else {
      setPendingPrompt(prompt);
      setIsRefinement(false);
      setShowPromptWizard(true);
    }
  };

  // Intercept template selection to ask database questions first!
  const handleTemplateClick = (template: PredefinedTemplate) => {
    if (isGenerating) return;
    setPendingPrompt(template.prompt);
    setIsRefinement(false);
    setShowPromptWizard(true);
  };

  // Handle wizard completion
  const handleWizardSubmit = (dbChoice: {
    useDb: boolean;
    dbType?: "Firebase" | "Supabase";
    config?: SavedDatabaseConfig;
  }) => {
    setShowPromptWizard(false);
    let finalPrompt = pendingPrompt;

    if (dbChoice.useDb && dbChoice.config) {
      const conf = dbChoice.config;
      const type = dbChoice.dbType;
      
      finalPrompt += `\n\n**IMPORTANT: Fampifandraisana Database Mivantana sy azo antoka (${type})**
Ampiasao ity fikirakirana ${type} manaraka ity mba hampifandraisana mivantana ny tranonkala amin'ny database:
Anaran'ny Tetikasa: ${conf.projectName}
Credentials (Atsofohy amin'ny alàlan'ny fomba azo antoka, mampiasà variables na inputs):
${JSON.stringify(conf.config, null, 2)}

Azafady:
1. Mamorona formulaire mifandray mivantana amin'io database io (ohatra: fandefasana hafatra ao amin'ny Firestore na fitahirizana data ao amin'ny Supabase table).
2. Manomeza sary na tabilao kely mampiseho ny status fifandraisana (ohatra: 'Database Connected' misy teboka maitso mamirapiratra).
3. Ambarao tsara ao amin'ny pejy hoe aiza no asiana API Keys na ahoana no fandehan'ny fampifandraisana mba ho mora ampiasaina.`;
    }

    onGenerate(finalPrompt, isRefinement);
    setPrompt("");
    setPendingPrompt("");
  };

  // Fun loading messages during generation in Malagasy
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const loadingMessages = [
    "Mamantatra ny torolalana sy ny lohahevitra...",
    "Manorina ny firafitry ny HTML sy ny sary...",
    "Mampihatra ny stila Tailwind CSS kanto...",
    "Mampiditra sary tsara tarehy avy amin'ny Unsplash...",
    "Manoratra script JavaScript ho an'ny fifandraisana...",
    "Manara-maso ny kaody sy ny preview...",
    "Efa kely sisa dia ho vonona ny tranonkalanao..."
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingMsgIdx(0);
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % loadingMessages.length);
      }, 4000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div className="flex-1 min-h-0 bg-slate-900/40 flex flex-col overflow-hidden text-slate-100 font-sans relative">
      
      {/* Top Active Chat Header */}
      <div className="px-4 py-3 md:px-6 md:py-4 border-b border-slate-800/60 bg-slate-900/50 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 md:w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
            <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div>
            <h4 className="text-white font-bold text-[10px] md:text-xs uppercase tracking-wider">Mpamorona Chat</h4>
            <p className="text-slate-400 text-[11px] md:text-xs mt-0.5 font-medium max-w-[180px] sm:max-w-md truncate">
              {projectName || "Tranonkala vaovao (Manorata prompt)"}
            </p>
          </div>
        </div>

        {isGenerating && (
          <div className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] text-sky-400 font-mono font-bold animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Mamorona...</span>
          </div>
        )}
      </div>

      {/* Chat Messages Stream or Empty State templates list */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-6 space-y-4 md:space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {chatHistory.length <= 1 ? (
          /* Empty Chat Area with Greeting & Templates */
          <div className="max-w-2xl mx-auto space-y-6 md:space-y-8 py-3 md:py-6 animate-fadeIn">
            {/* Display the welcome message as a real chat bubble at the top if present */}
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className="flex gap-3 md:gap-4 justify-start animate-slideUp mb-4 animate-fadeIn"
              >
                <div className="w-8 h-8 md:w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/10 border border-sky-400/20">
                  <Sparkles className="w-4 h-4 md:w-4.5 md:h-4.5 text-white animate-pulse" />
                </div>
                <div className="flex flex-col bg-slate-950/60 border border-slate-850/80 text-slate-200 rounded-2xl rounded-tl-none p-3.5 md:p-4.5 text-xs leading-relaxed max-w-[88%] shadow-xl">
                  <div className="flex items-center gap-2 mb-1.5 opacity-50 text-[9px] md:text-[10px] font-mono">
                    <span className="font-bold">DEVWEB AI MPAMORONA</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <p className="font-sans break-words whitespace-pre-wrap leading-relaxed text-[11px] md:text-xs">{msg.text}</p>
                </div>
              </div>
            ))}

            <div className="text-center space-y-2 pt-3 border-t border-slate-800/40">
              <div className="w-10 h-10 md:w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center mx-auto shadow-lg shadow-sky-500/10">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-white animate-pulse" />
              </div>
              <h2 className="text-white font-extrabold text-sm md:text-lg leading-tight font-sans tracking-tight">
                Inona no hamboarintsika androany?
              </h2>
              <p className="text-slate-400 text-[11px] md:text-xs max-w-sm mx-auto font-sans leading-relaxed">
                Soraty ny hevitrao na tsindrio ny iray amin'ireto template efa voaomana ireto mba hananganana tranonkala kanto sy mampiasa database mivantana.
              </p>
            </div>

            {/* Predefined Templates */}
            <div className="space-y-2">
              <h3 className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 px-1">
                Safidio ny Template efa vonona
              </h3>
              <div className="grid sm:grid-cols-2 gap-2.5">
                {PREDEFINED_TEMPLATES.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateClick(template)}
                    disabled={isGenerating}
                    className="flex text-left p-3 md:p-4 rounded-2xl bg-slate-950/40 hover:bg-slate-950/80 border border-slate-850 hover:border-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all group active:scale-[0.99]"
                  >
                    <div className="bg-slate-900 border border-slate-800 p-2 md:p-2.5 rounded-xl mr-3 group-hover:bg-slate-800/80 transition-all shrink-0">
                      {getTemplateIcon(template.icon)}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-[11px] md:text-xs text-slate-200 group-hover:text-white transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-slate-500 text-[9px] md:text-[10px] mt-0.5 leading-relaxed font-sans line-clamp-2">
                        {template.description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Help guidelines about database prompt sequence */}
            <div className="p-3 md:p-4 rounded-2xl bg-sky-500/5 border border-sky-500/10 text-slate-400 text-xs leading-relaxed flex gap-3 items-start">
              <Database className="w-4 h-4 md:w-5 md:h-5 text-sky-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="font-bold text-slate-200 text-[11px] md:text-xs mb-0.5">Fanontaniako momba ny Database (Sequence):</p>
                <p className="font-sans text-[10px] md:text-[11px] text-slate-400 leading-normal">
                  Rehefa mandefa prompt vaovao ianao, ny IA dia <strong>hanontany anao mivantana</strong> raha hampiasa Database (Supabase na Firebase) ianao ary hampiditra an'izany mivantana ao amin'ny kaody.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Actual Interactive Chat Stream */
          <div className="max-w-3xl mx-auto space-y-4 md:space-y-6">
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 md:gap-4 ${msg.sender === "user" ? "justify-end animate-slideUp" : "justify-start animate-slideUp"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-8 h-8 md:w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/10 border border-sky-400/20">
                    <Sparkles className="w-4 md:w-4.5 h-4 md:h-4.5 text-white" />
                  </div>
                )}
                
                <div
                  className={`flex flex-col rounded-2xl p-3 md:p-4 text-[11px] md:text-xs leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-sky-500 text-white rounded-tr-none shadow-lg shadow-sky-500/10 max-w-[88%] sm:max-w-[80%]"
                      : "bg-slate-950/60 border border-slate-850/80 text-slate-200 rounded-tl-none max-w-[90%] sm:max-w-[85%] shadow-xl"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5 opacity-50 text-[9px] md:text-[10px] font-mono">
                    <span className="font-bold">{msg.sender === "user" ? "Ianao" : "DEVWEB AI MPAMORONA"}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  
                  <p className="font-sans break-words whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  
                  {msg.code && (
                    <div className="mt-3 pt-3 border-t border-slate-850/60 flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 text-[9px] md:text-[10px] font-bold uppercase tracking-wider">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Vonona sy nampiharina ny kaody!</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => onSelectCode?.(msg.code!, msg.text)}
                          className="flex-1 min-w-[110px] flex items-center justify-center gap-1 bg-sky-500 hover:bg-sky-400 text-white text-[9px] md:text-[10px] font-extrabold uppercase py-2 px-3 rounded-xl transition-all shadow-md active:scale-95"
                          title="Hasehoy amin'ny Preview"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          <span>Hizaha Preview</span>
                        </button>
                        
                        <button
                          onClick={() => {
                            const filename = "tranonkala-mivantana.html";
                            const blob = new Blob([msg.code!], { type: "text/html;charset=utf-8;" });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement("a");
                            link.href = url;
                            link.setAttribute("download", filename);
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          }}
                          className="flex-1 min-w-[110px] flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-855 border border-slate-800 text-slate-300 text-[9px] md:text-[10px] font-extrabold uppercase py-2 px-3 rounded-xl transition-all active:scale-95"
                        >
                          <Download className="w-3 h-3 text-slate-400" />
                          <span>Telecharger</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {msg.sender === "user" && (
                  <div className="w-8 h-8 md:w-9 h-9 rounded-xl bg-slate-850 border border-slate-800 flex items-center justify-center shrink-0 shadow-md">
                    <User className="w-4 md:w-4.5 h-4 md:h-4.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isGenerating && (
              <div className="flex gap-3 md:gap-4 justify-start animate-pulse">
                <div className="w-8 h-8 md:w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-sky-500/15 border border-sky-400/20">
                  <Sparkles className="w-4 h-4 md:w-4.5 md:h-4.5 text-white animate-spin-slow" />
                </div>
                <div className="bg-slate-950/60 border border-slate-850/80 text-slate-200 rounded-2xl rounded-tl-none p-3 md:p-4.5 max-w-[90%] sm:max-w-[85%] flex flex-col gap-1.5 shadow-xl">
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-100" />
                    <div className="w-1.5 h-1.5 bg-sky-400 rounded-full animate-bounce delay-200" />
                  </div>
                  <span className="text-[10px] md:text-[11px] text-sky-400 font-mono font-bold uppercase tracking-wider">
                    {loadingMessages[loadingMsgIdx]}
                  </span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Centered ChatGPT Prompt Input Area */}
      <div className="p-2.5 sm:p-4 md:p-6 border-t border-slate-800/60 bg-slate-950/40 shrink-0">
        <div className="max-w-3xl mx-auto relative">
          <form onSubmit={handlePromptSubmit} className="relative flex items-center">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              disabled={isGenerating}
              placeholder={
                hasExistingCode
                  ? "Inona no fanitsiana tianao hatao?"
                  : "Soraty eto ny karazana tranonkala tianao hamboarina..."
              }
              className="w-full bg-slate-950/70 border border-slate-850/80 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 text-slate-100 placeholder-slate-750 rounded-2xl pl-3.5 pr-12 py-3.5 md:py-4 md:pr-14 text-xs resize-none h-14 sm:h-16 md:h-20 outline-none transition-all shadow-inner leading-normal sm:leading-relaxed"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePromptSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="absolute right-2 md:right-3.5 top-1/2 -translate-y-1/2 md:top-auto md:translate-y-0 md:bottom-3 bg-sky-500 hover:bg-sky-400 disabled:bg-slate-900 text-white disabled:text-slate-700 p-2.5 rounded-xl transition-all active:scale-95 shadow-lg flex items-center justify-center cursor-pointer"
              title="Alefaso"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="mt-1.5 flex justify-between text-[9px] md:text-[10px] text-slate-600 px-1 font-mono select-none">
            <span>Shift+Enter ho an'ny andalana vaovao</span>
            {hasExistingCode && (
              <span className="text-emerald-500 flex items-center gap-1 font-bold">
                Miasa amin'ny Kaody efa misy <Check className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Prompt Database Sequence Interception Dialog */}
      <PromptDatabaseWizard
        isOpen={showPromptWizard}
        onClose={() => setShowPromptWizard(false)}
        onOpenSettings={onOpenDatabaseSettings}
        onSubmit={handleWizardSubmit}
      />

    </div>
  );
}
