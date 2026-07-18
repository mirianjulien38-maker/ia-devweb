import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import ChatHistorySidebar from "./components/ChatHistorySidebar";
import ChatWorkspace from "./components/ChatWorkspace";
import PreviewArea from "./components/PreviewArea";
import DatabaseWizardModal from "./components/DatabaseWizardModal";
import DatabaseSettingsModal from "./components/DatabaseSettingsModal";
import AuthScreen from "./components/AuthScreen";
import RechargeModal from "./components/RechargeModal";
import AdminModal from "./components/AdminModal";
import { WebSiteProject, ChatMessage } from "./types";
import { Language, translations } from "./translations";
import FaqModal from "./components/FaqModal";
import { Sparkles, Code2, AlertTriangle, Layers, X, Trash2, ArrowRight, Eye, Menu, SidebarOpen, SidebarClose, Coins, ShieldCheck, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DEFAULT_WEBSITE_CODE } from "./defaultWebsite";

const INITIAL_PROJECT: WebSiteProject = {
  id: "proj-default",
  name: "GastroArt (Restaurant Template)",
  prompt: "Tranonkala tsara tarehy ho an'ny Restaurant Modern antsoina hoe 'GastroArt' misy menu, sary mampisakafo, ary reservation form interactive.",
  code: DEFAULT_WEBSITE_CODE,
  createdAt: new Date().toLocaleString()
};

export default function App() {
  const [currentProject, setCurrentProject] = useState<WebSiteProject | null>(INITIAL_PROJECT);
  const [projects, setProjects] = useState<WebSiteProject[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [showDatabaseWizard, setShowDatabaseWizard] = useState(false);
  const [showDatabaseSettings, setShowDatabaseSettings] = useState(false);
  const [mobileTab, setMobileTab] = useState<"builder" | "preview">("builder");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Authentication & Credits State
  const [user, setUser] = useState<{
    id: string;
    email: string;
    name: string;
    credits: number;
    tokensUsed: number;
    bonusClaimsCount: number;
    isAdmin: boolean;
  } | null>(null);
  
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [language, setLanguage] = useState<Language>("mg");
  const [showFaqModal, setShowFaqModal] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    const savedProjects = localStorage.getItem("devweb-ia-projects");
    const savedCurrent = localStorage.getItem("devweb-ia-current");
    const savedChat = localStorage.getItem("devweb-ia-chat");
    const savedUser = localStorage.getItem("devweb-ia-user");
    const savedLang = localStorage.getItem("devweb-ia-lang");

    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }
    if (savedCurrent) {
      setCurrentProject(JSON.parse(savedCurrent));
    }
    if (savedChat) {
      const parsedChat = JSON.parse(savedChat);
      if (parsedChat.length === 0) {
        setChatHistory([
          {
            id: "welcome-ai",
            sender: "ai",
            text: "Salama tompoko! Faly miarahaba anao aho. Inona no karazana tranonkala (site web) tianao hamboarina na hoforonina androany?",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          }
        ]);
      } else {
        setChatHistory(parsedChat);
      }
    } else {
      setChatHistory([
        {
          id: "welcome-ai",
          sender: "ai",
          text: "Salama tompoko! Faly miarahaba anao aho. Inona no karazana tranonkala (site web) tianao hamboarina na hoforonina androany?",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }
      ]);
    }
    if (savedLang) {
      setLanguage(savedLang as Language);
    }
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      
      // Perform session synchronization to ensure the server DB contains this user's state
      // as well as any Gemini API keys that we have saved in client storage!
      const savedKeys = localStorage.getItem("devweb-ia-gemini-keys");
      const geminiKeys = savedKeys ? JSON.parse(savedKeys) : [];
      
      fetch("/api/sync-render-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user: parsedUser,
          geminiKeys: geminiKeys
        })
      })
      .then(res => res.json())
      .then(data => {
        console.log("Mampifanaraka amin'ny Render server...", data);
        // Once synced, call syncUserStatus to fetch the absolute latest credits/stats
        syncUserStatus(parsedUser.email);
      })
      .catch(err => {
        console.error("Fahadisoana rehefa nampifanaraka ny session:", err);
        syncUserStatus(parsedUser.email);
      });
    }
  }, []);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("devweb-ia-lang", lang);
  };

  // Sync user status from server to keep credits, token usage in sync
  const syncUserStatus = async (email: string) => {
    try {
      const response = await fetch("/api/user-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUser(data.user);
        localStorage.setItem("devweb-ia-user", JSON.stringify(data.user));
      }
    } catch (err) {
      console.error("Tsy nahomby ny fampifanarahana ny mombamomba:", err);
    }
  };

  // Save to local storage helpers
  const saveProjectsToStorage = (updatedProjects: WebSiteProject[]) => {
    localStorage.setItem("devweb-ia-projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const saveCurrentProjectToStorage = (proj: WebSiteProject | null) => {
    if (proj) {
      localStorage.setItem("devweb-ia-current", JSON.stringify(proj));
    } else {
      localStorage.removeItem("devweb-ia-current");
    }
    setCurrentProject(proj);
  };

  const saveChatToStorage = (chat: ChatMessage[], overrideProject?: WebSiteProject | null) => {
    localStorage.setItem("devweb-ia-chat", JSON.stringify(chat));
    setChatHistory(chat);
    
    const projToUpdate = overrideProject !== undefined ? overrideProject : currentProject;
    if (projToUpdate) {
      const updatedProj = { ...projToUpdate, chatHistory: chat };
      localStorage.setItem("devweb-ia-current", JSON.stringify(updatedProj));
      setCurrentProject(updatedProj);
      
      const updatedProjs = projects.map((p) => p.id === projToUpdate.id ? updatedProj : p);
      localStorage.setItem("devweb-ia-projects", JSON.stringify(updatedProjs));
      setProjects(updatedProjs);
    }
  };

  // Auth screen login/signup trigger
  const handleAuthSuccess = (authenticatedUser: any) => {
    setUser(authenticatedUser);
    localStorage.setItem("devweb-ia-user", JSON.stringify(authenticatedUser));
    // Pull stats in case they logged in
    syncUserStatus(authenticatedUser.email);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("devweb-ia-user");
  };

  const handleApplyDatabaseCode = (code: string, filename: string) => {
    const isFirebase = filename.includes("firebase");
    const dbName = isFirebase ? "Firebase" : "Supabase";
    setMobileTab("builder"); // Miverina amin'ny builder mba hahitany ny chat misy ny code snippet
    
    // Add user config message
    const userMsg: ChatMessage = {
      id: `user-db-${Date.now()}`,
      sender: "user",
      text: `Nampiditra fikirakirana database ${dbName} tamin'ny alalan'ny Wizard Interactive aho.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    // Add AI response message containing the database file code
    const aiMsg: ChatMessage = {
      id: `ai-db-${Date.now()}`,
      sender: "ai",
      text: `Tafajoro soa aman-tsara ny rafitra fampifandraisana Database ${dbName}! 

Mba hampiasana ity database ity ao amin'ny tranonkalanao:
1. Adikao ny kaody fampifandraisana etsy ambany ary tahirizo amin'ny anarana hoe \`${filename}\`.
2. Atsofohy ao amin'ny tontolo voaaro (.env na ao amin'ny AI Studio Secrets) ireo variables voalaza ao amin'ny dingana faha-3.
3. Ampidiro ao anaty pejy web-nao ny function hanoratra na hamaky data (ohatra: hanoratra hafatra avy amin'ny form na hisoratra anarana).

Miaraka amin'izany, ny tsiambaratelonao rehetra dia voaaro tsara ary tsy miseho amin'ny fomba tsy ara-dalàna.`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      code: code
    };

    const finalHistory = [...chatHistory, userMsg, aiMsg];
    saveChatToStorage(finalHistory);
  };

  // Generate / Refine Website
  const handleGenerateSite = async (userPrompt: string, refine: boolean = false) => {
    if (!user) {
      setErrorMessage("Mila miditra (connexion) ianao mialoha ny hamoronana tranonkala.");
      return;
    }

    if (user.credits <= 0) {
      setErrorMessage("Lany ny fahana (credit) anao. Azafady, mividiana fahana fanampiny vao afaka manohy.");
      setShowRechargeModal(true);
      return;
    }

    if (isGenerating) return;
    setIsGenerating(true);
    setErrorMessage(null);
    setMobileTab("preview"); // Ampifandimbiasina mankany amin'ny preview mba hahitany ny sary mivantana avy hatrany

    // Create a unique temporary user chat message
    const userMessageId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMessageId,
      sender: "user",
      text: userPrompt,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const updatedHistory = [...chatHistory, newUserMsg];
    saveChatToStorage(updatedHistory);

    try {
      const response = await fetch("/api/generate-site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: userPrompt,
          existingCode: refine && currentProject ? currentProject.code : undefined,
          userEmail: user.email
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // If it's a payment/credit exhaust error, automatically pop open the Recharge Modal!
        if (response.status === 402 || data.isCreditsExhausted) {
          setShowRechargeModal(true);
        }
        throw new Error(data.error || "Nisy olana teo amin'ny famoronana ny tranonkala.");
      }

      // Update user credits in state & storage
      if (data.userCredits !== undefined) {
        const updatedUser = { ...user, credits: data.userCredits };
        setUser(updatedUser);
        localStorage.setItem("devweb-ia-user", JSON.stringify(updatedUser));
      }

      // Add to AI chat response
      const aiMessageId = `ai-${Date.now()}`;
      const promptSnippet = userPrompt.substring(0, 25).trim() + (userPrompt.length > 25 ? "..." : "");
      const matchedTitle = userPrompt.match(/antsoina hoe ['"](.*?)['"]/i) || userPrompt.match(/named ['"](.*?)['"]/i);
      const derivedName = matchedTitle ? matchedTitle[1] : `Tetikasa - ${promptSnippet}`;

      const newAiMsg: ChatMessage = {
        id: aiMessageId,
        sender: "ai",
        text: refine 
          ? `Nohavaozina soa aman-tsara ny tranonkalanao araka ny torolalana: "${userPrompt}". Hitanao ao amin'ny preview ny vokatry ny fanovana. (Nandany ${data.creditCost} credits)`
          : `Tafajoro soa aman-tsara ny tranonkalanao! "${derivedName}". Afaka telecharger-nao mivantana ho fichier HTML io na sivaninao eto ihany koa. (Nandany ${data.creditCost} credits)`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        code: data.code
      };

      const finalHistory = [...updatedHistory, newAiMsg];

      // Generate a new project object or update the existing one
      const timestampString = new Date().toLocaleString();
      let updatedProject: WebSiteProject;

      if (refine && currentProject) {
        updatedProject = {
          ...currentProject,
          code: data.code,
          explanation: data.rawExplanation,
          createdAt: timestampString, // Keep track of latest edit
          chatHistory: finalHistory
        };
      } else {
        updatedProject = {
          id: `proj-${Date.now()}`,
          name: derivedName,
          prompt: userPrompt,
          code: data.code,
          explanation: data.rawExplanation,
          createdAt: timestampString,
          chatHistory: finalHistory
        };
      }

      saveCurrentProjectToStorage(updatedProject);
      saveChatToStorage(finalHistory, updatedProject);

      // Save into project history list
      const alreadyExists = projects.find((p) => p.id === updatedProject.id);
      let newProjectsList: WebSiteProject[];
      if (alreadyExists) {
        newProjectsList = projects.map((p) => (p.id === updatedProject.id ? updatedProject : p));
      } else {
        newProjectsList = [updatedProject, ...projects];
      }
      saveProjectsToStorage(newProjectsList);

    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Nisy fahadisoana teo am-pifandraisana amin'ny mpizara.");
      
      const aiErrorMsgId = `ai-err-${Date.now()}`;
      const newAiErrorMsg: ChatMessage = {
        id: aiErrorMsgId,
        sender: "ai",
        text: `Miala tsiny, nisy fahadisoana teo am-panatanterahana ny baikonao. Olana: ${err.message || "Nisy olana tsy fantatra."}`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      saveChatToStorage([...updatedHistory, newAiErrorMsg]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNewProject = () => {
    saveCurrentProjectToStorage(null);
    saveChatToStorage([
      {
        id: `welcome-ai-${Date.now()}`,
        sender: "ai",
        text: "Salama tompoko! Faly miarahaba anao aho. Inona no karazana tranonkala (site web) tianao hamboarina na hoforonina androany?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
    setErrorMessage(null);
  };

  const handleSelectProject = (proj: WebSiteProject) => {
    saveCurrentProjectToStorage(proj);
    setShowProjectsModal(false);
    
    // Restore the actual chat history for this project!
    if (proj.chatHistory && proj.chatHistory.length > 0) {
      localStorage.setItem("devweb-ia-chat", JSON.stringify(proj.chatHistory));
      setChatHistory(proj.chatHistory);
    } else {
      const loadMsg: ChatMessage = {
        id: `system-${Date.now()}`,
        sender: "ai",
        text: `Nampidirina soa aman-tsara ny tetikasa "${proj.name}". Azonao atao ny manohy manitsy na misintona azy mivantana.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        code: proj.code
      };
      const initialChat = [loadMsg];
      localStorage.setItem("devweb-ia-chat", JSON.stringify(initialChat));
      setChatHistory(initialChat);
    }
  };

  const handleDeleteProject = (projId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = projects.filter((p) => p.id !== projId);
    saveProjectsToStorage(filtered);

    if (currentProject && currentProject.id === projId) {
      handleNewProject();
    }
  };

  const handleClearHistory = () => {
    saveChatToStorage([
      {
        id: `welcome-ai-${Date.now()}`,
        sender: "ai",
        text: "Salama tompoko! Faly miarahaba anao aho. Inona no karazana tranonkala (site web) tianao hamboarina na hoforonina androany?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ]);
  };

  const handleSelectCode = (code: string, text: string) => {
    const snippet = text.substring(0, 25).trim() + (text.length > 25 ? "..." : "");
    const selectedProj: WebSiteProject = {
      id: currentProject?.id || `proj-direct-${Date.now()}`,
      name: currentProject?.name || `Tetikasa - ${snippet}`,
      prompt: currentProject?.prompt || text,
      code: code,
      explanation: text,
      createdAt: new Date().toLocaleString()
    };
    saveCurrentProjectToStorage(selectedProj);
  };

  // If user is not logged in, force the Auth screen!
  if (!user) {
    return <AuthScreen onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="flex flex-col h-screen h-[100dvh] w-screen bg-slate-950 text-slate-100 overflow-hidden select-none">
      
      {/* Header with auth indicators, credits, and admin buttons */}
      <Header
        currentProjectName={currentProject ? currentProject.name : ""}
        isGenerating={isGenerating}
        onNewProject={handleNewProject}
        onOpenDatabaseWizard={() => setShowDatabaseWizard(true)}
        user={user}
        onOpenRecharge={() => setShowRechargeModal(true)}
        onOpenAdmin={() => setShowAdminModal(true)}
        onLogout={handleLogout}
        language={language}
      />

      {/* Floating History button with Sidebar Toggle */}
      <div className="bg-slate-900/60 border-b border-slate-800 px-6 py-2.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all mr-2 flex items-center justify-center border border-slate-800"
            title={isSidebarOpen ? translations[language].collapseSidebar : translations[language].expandSidebar}
          >
            {isSidebarOpen ? <SidebarClose className="w-4 h-4" /> : <SidebarOpen className="w-4 h-4" />}
          </button>
          <Sparkles className="w-3.5 h-3.5 text-sky-400" />
          <span>{translations[language].currentProject}</span>
          <span className="text-slate-200 font-semibold ml-1">
            {currentProject ? currentProject.name : translations[language].activeProject}
          </span>
        </div>

        <button
          onClick={() => setShowProjectsModal(true)}
          className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 transition-colors font-semibold py-1 px-3 bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/20 rounded-xl"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{language === "mg" ? "Ireo Tranonkala Voaforona" : language === "fr" ? "Projets créés" : "Built Websites"} ({projects.length})</span>
        </button>
      </div>

      {/* Mobile/Tablet View Switcher - Only visible below lg screen width */}
      <div className="lg:hidden flex bg-slate-900 border-b border-slate-800 p-1.5 shrink-0 gap-2 select-none">
        <button
          onClick={() => setMobileTab("builder")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
            mobileTab === "builder"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/10"
              : "text-slate-400 hover:text-slate-200 bg-slate-950/40 hover:bg-slate-950/80"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {translations[language].builderTab}
        </button>
        <button
          onClick={() => setMobileTab("preview")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-[0.98] ${
            mobileTab === "preview"
              ? "bg-sky-500 text-white shadow-lg shadow-sky-500/10"
              : "text-slate-400 hover:text-slate-200 bg-slate-950/40 hover:bg-slate-950/80"
          }`}
        >
          <Eye className="w-4 h-4" />
          {translations[language].previewTab}
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Sidebar (ChatGPT-style) - Desktop */}
        <ChatHistorySidebar
          projects={projects}
          currentProjectId={currentProject ? currentProject.id : undefined}
          onSelectProject={handleSelectProject}
          onDeleteProject={handleDeleteProject}
          onNewProject={handleNewProject}
          onOpenDatabaseSettings={() => setShowDatabaseSettings(true)}
          onClearHistory={handleClearHistory}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          user={user}
          onOpenRecharge={() => setShowRechargeModal(true)}
          language={language}
          onLanguageChange={handleLanguageChange}
          onOpenFaq={() => setShowFaqModal(true)}
        />

        {/* Mobile/Tablet Overlaid Sidebar */}
        {isSidebarOpen && (
          <div className="lg:hidden absolute inset-0 z-40 flex">
            <div className="w-[280px] h-full shadow-2xl relative z-50">
              <ChatHistorySidebar
                projects={projects}
                currentProjectId={currentProject ? currentProject.id : undefined}
                onSelectProject={handleSelectProject}
                onDeleteProject={handleDeleteProject}
                onNewProject={handleNewProject}
                onOpenDatabaseSettings={() => setShowDatabaseSettings(true)}
                onClearHistory={handleClearHistory}
                isOpen={true}
                onToggle={() => setIsSidebarOpen(false)}
                user={user}
                onOpenRecharge={() => setShowRechargeModal(true)}
                language={language}
                onLanguageChange={handleLanguageChange}
                onOpenFaq={() => setShowFaqModal(true)}
              />
            </div>
            <div 
              onClick={() => setIsSidebarOpen(false)}
              className="flex-1 bg-slate-950/60 backdrop-blur-xs"
            />
          </div>
        )}

        {/* Middle Chat Panel */}
        <div className={`flex-1 h-full overflow-hidden ${mobileTab === "builder" ? "flex flex-col" : "hidden lg:flex lg:flex-col"}`}>
          <ChatWorkspace
            onGenerate={handleGenerateSite}
            isGenerating={isGenerating}
            hasExistingCode={!!currentProject}
            chatHistory={chatHistory}
            onClearHistory={handleClearHistory}
            onSelectCode={handleSelectCode}
            projectName={currentProject ? currentProject.name : ""}
            onOpenDatabaseSettings={() => setShowDatabaseSettings(true)}
          />
        </div>

        {/* Right Iframe & Preview Panel */}
        <div className={`flex-1 h-full overflow-hidden ${mobileTab === "preview" ? "flex flex-col" : "hidden lg:flex lg:flex-col"} border-l border-slate-800/60`}>
          <PreviewArea
            code={currentProject ? currentProject.code : ""}
            projectName={currentProject ? currentProject.name : ""}
            isGenerating={isGenerating}
          />
        </div>

        {/* Error Alert Overlay */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-6 right-6 z-50 bg-rose-950 border-l-4 border-rose-500 text-rose-100 px-5 py-4 rounded-xl shadow-2xl shadow-rose-950/50 max-w-md flex gap-3.5 items-start"
            >
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h5 className="font-sans font-bold text-sm">Nisy Fahadisoana</h5>
                <p className="text-rose-300 text-xs mt-1 leading-relaxed">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-rose-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Database Setup Wizard Modal */}
      <DatabaseWizardModal
        isOpen={showDatabaseWizard}
        onClose={() => setShowDatabaseWizard(false)}
        onApplyCode={handleApplyDatabaseCode}
      />

      {/* Database Settings Parameter Modal */}
      <DatabaseSettingsModal
        isOpen={showDatabaseSettings}
        onClose={() => setShowDatabaseSettings(false)}
        onSaveSuccess={() => setShowDatabaseSettings(false)}
      />

      {/* Credit / Recharge Modal */}
      <RechargeModal
        isOpen={showRechargeModal}
        onClose={() => setShowRechargeModal(false)}
        user={user}
        onUserUpdate={(updatedUser) => {
          setUser(updatedUser);
          localStorage.setItem("devweb-ia-user", JSON.stringify(updatedUser));
        }}
      />

      {/* Admin Dashboard Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        adminEmail={user.email}
        onTriggerUserSync={() => syncUserStatus(user.email)}
      />

      {/* Project Manager Modal */}
      <AnimatePresence>
        {showProjectsModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans text-slate-100">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-sky-400" />
                  <h3 className="font-sans font-extrabold text-lg text-white">Ny Tranonkalanao Rehetra</h3>
                </div>
                <button
                  onClick={() => setShowProjectsModal(false)}
                  className="text-slate-400 hover:text-slate-200 transition-colors p-1.5 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1 space-y-3">
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    <Code2 className="w-12 h-12 text-slate-800 mx-auto mb-3" />
                    <p className="text-sm font-medium">Mbola tsy nisy tranonkala voaforona.</p>
                    <p className="text-xs mt-1 text-slate-600">
                      Ampiasao ny sidebar hamoronana ny tranonkala voalohany anao!
                    </p>
                  </div>
                ) : (
                  projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleSelectProject(proj)}
                      className={`flex justify-between items-center p-4 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] active:scale-[0.99] ${
                        currentProject && currentProject.id === proj.id
                          ? "bg-sky-500/10 border-sky-500 text-white"
                          : "bg-slate-800/50 border-slate-700/50 hover:border-slate-600 text-slate-200 hover:bg-slate-800"
                      }`}
                    >
                      <div className="flex-1 pr-4">
                        <div className="flex items-center gap-2">
                          <h4 className="font-sans font-bold text-sm truncate max-w-sm">
                            {proj.name}
                          </h4>
                          {currentProject && currentProject.id === proj.id && (
                            <span className="bg-sky-400/10 text-sky-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                              Miasa izao
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs truncate max-w-md mt-1 italic">
                          "{proj.prompt}"
                        </p>
                        <span className="text-[10px] font-mono text-slate-500 mt-2 block">
                          Voaforona tamin'ny: {proj.createdAt}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-sky-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold">
                          Sokafy <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                        <button
                          onClick={(e) => handleDeleteProject(proj.id, e)}
                          className="p-2 text-slate-500 hover:text-rose-400 transition-colors rounded-xl hover:bg-rose-500/10"
                          title="Fafao ity tranonkala ity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FAQ & Professional Documentation Modal */}
      <FaqModal
        isOpen={showFaqModal}
        onClose={() => setShowFaqModal(false)}
        language={language}
      />
    </div>
  );
}
