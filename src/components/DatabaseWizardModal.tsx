import React, { useState } from "react";
import { 
  X, Database, Check, ChevronRight, ChevronLeft, 
  Lock, Copy, Server, Code, Sparkles, ShieldCheck, Terminal, Download
} from "lucide-react";

interface DatabaseWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCode?: (code: string, name: string) => void;
}

interface DBStructure {
  name: string;
  description: string;
  fields: string[];
}

const COMMON_STRUCTURES: Record<string, DBStructure[]> = {
  Firebase: [
    { name: "users", description: "Tahiriana ny mombamomba ny mpampiasa (Users profiles)", fields: ["uid", "email", "displayName", "photoURL", "createdAt"] },
    { name: "messages", description: "Tahiriana ny hafatra amin'ny chat (Chat messages)", fields: ["id", "text", "senderId", "senderName", "timestamp"] },
    { name: "products", description: "Tahiriana ny entana amidy (Products catalog)", fields: ["id", "name", "price", "description", "imageUrl", "stock"] },
    { name: "orders", description: "Tahiriana ny kaomandy (Customer orders)", fields: ["id", "userId", "items", "totalAmount", "status", "createdAt"] },
    { name: "posts", description: "Bilaogy na lahatsoratra (Blog posts)", fields: ["id", "title", "content", "author", "likes", "publishedAt"] },
    { name: "contact_submissions", description: "Hafatra nalefan'ny mpitsidika (Contact submissions)", fields: ["id", "fullName", "email", "message", "sentAt"] }
  ],
  Supabase: [
    { name: "profiles", description: "Tabilao ho an'ny mombamomba ny mpampiasa (Profiles table)", fields: ["id (uuid)", "email (text)", "display_name (text)", "avatar_url (text)", "updated_at (timestamp)"] },
    { name: "messages", description: "Tabilao ho an'ny resaka chat (Messages table)", fields: ["id (bigint)", "text (text)", "sender_id (uuid)", "sender_name (text)", "created_at (timestamp)"] },
    { name: "products", description: "Tabilao ho an'ny entana amidy (Products table)", fields: ["id (bigint)", "name (text)", "price (numeric)", "description (text)", "image_url (text)", "stock (integer)"] },
    { name: "orders", description: "Tabilao ho an'ny kaomandy (Orders table)", fields: ["id (uuid)", "user_id (uuid)", "total_amount (numeric)", "status (text)", "created_at (timestamp)"] },
    { name: "posts", description: "Tabilao ho an'ny bilaogy (Posts table)", fields: ["id (bigint)", "title (text)", "content (text)", "author_name (text)", "likes (integer)", "created_at (timestamp)"] },
    { name: "contact_messages", description: "Tabilao ho an'ny hafatra avy amin'ny form (Contact submissions)", fields: ["id (bigint)", "full_name (text)", "email (text)", "message (text)", "created_at (timestamp)"] }
  ]
};

export default function DatabaseWizardModal({ isOpen, onClose, onApplyCode }: DatabaseWizardModalProps) {
  const [step, setStep] = useState(1);
  const [provider, setProvider] = useState<"Firebase" | "Supabase">("Firebase");
  const [selectedStructures, setSelectedStructures] = useState<string[]>(["users", "contact_submissions"]);
  const [customStructureName, setCustomStructureName] = useState("");
  
  // Environment Key Inputs
  // Firebase config
  const [fbApiKey, setFbApiKey] = useState("");
  const [fbAuthDomain, setFbAuthDomain] = useState("");
  const [fbProjectId, setFbProjectId] = useState("");
  const [fbStorageBucket, setFbStorageBucket] = useState("");
  const [fbMessagingSenderId, setFbMessagingSenderId] = useState("");
  const [fbAppId, setFbAppId] = useState("");

  // Supabase config
  const [sbUrl, setSbUrl] = useState("");
  const [sbAnonKey, setSbAnonKey] = useState("");

  const [copiedText, setCopiedText] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const toggleStructure = (name: string) => {
    if (selectedStructures.includes(name)) {
      setSelectedStructures(selectedStructures.filter(n => n !== name));
    } else {
      setSelectedStructures([...selectedStructures, name]);
    }
  };

  const handleAddCustomStructure = () => {
    const trimmed = customStructureName.trim().toLowerCase();
    if (trimmed && !selectedStructures.includes(trimmed)) {
      setSelectedStructures([...selectedStructures, trimmed]);
      // Add a virtual structure to the options
      if (!COMMON_STRUCTURES[provider].some(s => s.name === trimmed)) {
        COMMON_STRUCTURES[provider].push({
          name: trimmed,
          description: `Tetikasa manokana fitehirizana ${trimmed}`,
          fields: ["id", "createdAt", "updatedAt"]
        });
      }
      setCustomStructureName("");
    }
  };

  // Generate code based on settings
  const generateEnvTemplate = () => {
    if (provider === "Firebase") {
      return `# .env.example - Atsofohy ao amin'ny Settings > Secrets ireto variable ireto
VITE_FIREBASE_API_KEY="${fbApiKey || "YOUR_FIREBASE_API_KEY"}"
VITE_FIREBASE_AUTH_DOMAIN="${fbAuthDomain || "your-app.firebaseapp.com"}"
VITE_FIREBASE_PROJECT_ID="${fbProjectId || "your-app-id"}"
VITE_FIREBASE_STORAGE_BUCKET="${fbStorageBucket || "your-app.appspot.com"}"
VITE_FIREBASE_MESSAGING_SENDER_ID="${fbMessagingSenderId || "1234567890"}"
VITE_FIREBASE_APP_ID="${fbAppId || "1:1234567890:web:abcdef123456"}"`;
    } else {
      return `# .env.example - Atsofohy ao amin'ny Settings > Secrets ireto variable ireto
VITE_SUPABASE_URL="${sbUrl || "https://your-project.supabase.co"}"
VITE_SUPABASE_ANON_KEY="${sbAnonKey || "your-supabase-anon-key"}"`;
    }
  };

  const generateCodeTemplate = () => {
    if (provider === "Firebase") {
      const dbFunctions = selectedStructures.map(struct => {
        const capitalized = struct.charAt(0).toUpperCase() + struct.slice(1);
        return `
// ==========================================
// SERIVISY HO AN'NY: ${struct.toUpperCase()}
// ==========================================

/**
 * Manampy angon-drakitra (data) vaovao ao amin'ny collection '${struct}'
 */
export async function add${capitalized}Data(data: any) {
  try {
    const docRef = await addDoc(collection(db, "${struct}"), {
      ...data,
      createdAt: serverTimestamp()
    });
    console.log("Data ${struct} voatahiry miaraka amin'ny ID: ", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Fahadisoana tamin'ny fitehirizana ${struct}: ", error);
    throw error;
  }
}

/**
 * Maka ny angon-drakitra rehetra avy amin'ny collection '${struct}' voasivana na alahatra
 */
export async function get${capitalized}List() {
  try {
    const q = query(collection(db, "${struct}"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    console.error("Fahadisoana tamin'ny fakana ${struct}: ", error);
    return [];
  }
}`;
      }).join("\n");

      return `import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Fikirakirana Firebase mampiasa Secrets ho fiarovana ny API Key
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "${fbApiKey || "YOUR_FIREBASE_API_KEY"}",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "${fbAuthDomain || "your-app.firebaseapp.com"}",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "${fbProjectId || "your-app-id"}",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "${fbStorageBucket || "your-app.appspot.com"}",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "${fbMessagingSenderId || "1234567890"}",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "${fbAppId || "1:1234567890:web:abcdef123456"}"
};

// Initialisation an'i Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
${dbFunctions}
`;
    } else {
      // Supabase
      const dbFunctions = selectedStructures.map(struct => {
        const capitalized = struct.charAt(0).toUpperCase() + struct.slice(1);
        return `
// ==========================================
// SERIVISY HO AN'NY: ${struct.toUpperCase()}
// ==========================================

/**
 * Manampy angon-drakitra (row) vaovao ao amin'ny tabilao '${struct}'
 */
export async function insert${capitalized}Row(row: any) {
  const { data, error } = await supabase
    .from("${struct}")
    .insert([row])
    .select();

  if (error) {
    console.error("Fahadisoana tamin'ny fampidirana ao amin'ny ${struct}: ", error.message);
    throw error;
  }
  return data;
}

/**
 * Maka ny angon-drakitra rehetra avy amin'ny tabilao '${struct}'
 */
export async function select${capitalized}List() {
  const { data, error } = await supabase
    .from("${struct}")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Fahadisoana tamin'ny fakana angon-drakitra ${struct}: ", error.message);
    return [];
  }
  return data;
}`;
      }).join("\n");

      // Supabase SQL helper schema
      const sqlSchema = selectedStructures.map(struct => {
        return `
-- SQL Schema ho an'ny tabilao: ${struct}
create table if not exists public.${struct} (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Atsofohy eto ny tsanganana (columns) ilainao
  content text,
  metadata jsonb
);

-- Active ny Row Level Security (RLS) ho fiarovana tsara
alter table public.${struct} enable row level security;
create policy "Afaka mamaky ny rehetra" on public.${struct} for select using (true);
create policy "Afaka mampiditra ny rehetra" on public.${struct} for insert with check (true);
`;
      }).join("\n");

      return {
        ts: `import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "${sbUrl || "https://your-project.supabase.co"}";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "${sbAnonKey || "your-supabase-anon-key"}";

// Hamorona mpanjifa (client) mivantana
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
${dbFunctions}
`,
        sql: sqlSchema
      };
    }
  };

  const handleApplyToApp = () => {
    const codeObj = generateCodeTemplate();
    const finalCode = typeof codeObj === "string" ? codeObj : codeObj.ts;
    const fileName = provider === "Firebase" ? "firebase_connection.ts" : "supabase_connection.ts";
    if (onApplyCode) {
      onApplyCode(finalCode, fileName);
    }
    onClose();
  };

  const codeResult = generateCodeTemplate();
  const codeString = typeof codeResult === "string" ? codeResult : codeResult.ts;
  const sqlString = typeof codeResult === "string" ? "" : codeResult.sql;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800/80 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-800/85 bg-slate-900/50 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-sky-500/10 text-sky-400 p-2.5 rounded-xl border border-sky-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-none">Mpamorona Database Wizard</h3>
              <p className="text-slate-400 text-xs mt-1.5 font-sans">
                Fikirakirana sy fampifandraisana Firebase na Supabase ho an'ny tranonkalanao
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

        {/* Steps Progress */}
        <div className="bg-slate-950/40 px-6 py-3 border-b border-slate-800/60 flex items-center justify-between text-xs font-semibold text-slate-400">
          <div className="flex items-center gap-6">
            <span className={`flex items-center gap-1.5 ${step >= 1 ? "text-sky-400 font-bold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-sky-500 text-white" : step > 1 ? "bg-sky-500/20 text-sky-400" : "bg-slate-800"}`}>1</span>
              Provider
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            <span className={`flex items-center gap-1.5 ${step >= 2 ? "text-sky-400 font-bold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-sky-500 text-white" : step > 2 ? "bg-sky-500/20 text-sky-400" : "bg-slate-800"}`}>2</span>
              Structure
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            <span className={`flex items-center gap-1.5 ${step >= 3 ? "text-sky-400 font-bold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? "bg-sky-500 text-white" : step > 3 ? "bg-sky-500/20 text-sky-400" : "bg-slate-800"}`}>3</span>
              Secrets
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-700" />
            <span className={`flex items-center gap-1.5 ${step >= 4 ? "text-sky-400 font-bold" : ""}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 4 ? "bg-sky-500 text-white" : "bg-slate-800"}`}>4</span>
              Code vokatra
            </span>
          </div>
          <div className="text-slate-500">
            Dingan-dingana {step} amin'ny 4
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: SELECT PROVIDER */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h4 className="text-white text-sm font-bold uppercase tracking-wider">Misafidiana ny Database mifanaraka aminao</h4>
                <p className="text-slate-400 text-xs">Ny Firebase dia tena tsara ho an'ny NoSQL sy real-time haingana, ny Supabase kosa dia dikan-teny malalaka ho an'ny SQL / PostgreSQL matanjaka.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Firebase Option */}
                <button
                  type="button"
                  onClick={() => setProvider("Firebase")}
                  className={`p-6 rounded-2xl border text-left transition-all duration-300 relative group overflow-hidden ${
                    provider === "Firebase" 
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5" 
                      : "bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="bg-amber-500/10 text-amber-500 p-3 rounded-xl border border-amber-500/20">
                      <i className="fa-solid fa-fire text-2xl"></i>
                    </div>
                    {provider === "Firebase" && (
                      <span className="bg-sky-500 text-white p-1 rounded-full text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-white text-lg mt-4">Google Firebase</h5>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-sans">
                    NoSQL Document database (Firestore), Authentication ary Real-time synchro maimaim-poana. Tsotra be fampiasana ho an'ny SPA.
                  </p>
                </button>

                {/* Supabase Option */}
                <button
                  type="button"
                  onClick={() => setProvider("Supabase")}
                  className={`p-6 rounded-2xl border text-left transition-all duration-300 relative group overflow-hidden ${
                    provider === "Supabase" 
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-lg shadow-sky-500/5" 
                      : "bg-slate-950/60 border-slate-850 hover:border-slate-700 text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="bg-emerald-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20">
                      <i className="fa-solid fa-database text-2xl"></i>
                    </div>
                    {provider === "Supabase" && (
                      <span className="bg-sky-500 text-white p-1 rounded-full text-[10px]">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-white text-lg mt-4">Supabase (PostgreSQL)</h5>
                  <p className="text-slate-400 text-xs mt-1.5 leading-relaxed font-sans">
                    Relational SQL database miaraka amin'ny fiarovana RLS matanjaka sy auto-generated REST APIs. Tena tsara amin'ny rafitra saro-pady.
                  </p>
                </button>
              </div>

              {/* Security info */}
              <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-2xl flex gap-3 text-slate-400 text-xs">
                <Lock className="w-5 h-5 text-sky-400 shrink-0" />
                <div>
                  <h6 className="font-semibold text-slate-300 mb-0.5">Arovy ny API Key anao</h6>
                  <p className="font-sans leading-relaxed">
                    Isaky ny misafidy database ianao, ny DEVWEB IA dia hanampy config mampiasa <code className="text-sky-300">import.meta.env</code> na <code className="text-sky-300">process.env</code> mba hitazonana ny tsiambaratelonao ho voaaro.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT STRUCTURES */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h4 className="text-white text-sm font-bold uppercase tracking-wider">Inona avy ireo Collections na Tables ilainao?</h4>
                <p className="text-slate-400 text-xs">Misafidiana amin'ireto soso-kevitra efa pre-filled manaraka ireto, na mamoròna vaovao mivantana.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {COMMON_STRUCTURES[provider].map((struct) => {
                  const isChecked = selectedStructures.includes(struct.name);
                  return (
                    <button
                      key={struct.name}
                      type="button"
                      onClick={() => toggleStructure(struct.name)}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        isChecked 
                          ? "bg-sky-500/5 border-sky-500 text-sky-400" 
                          : "bg-slate-950/60 border-slate-850 text-slate-300 hover:bg-slate-900"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700/60">
                          {struct.name}
                        </span>
                        <span className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] ${
                          isChecked ? "bg-sky-500 border-sky-500 text-white" : "border-slate-700"
                        }`}>
                          {isChecked && "✓"}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed font-sans">{struct.description}</p>
                      <div className="mt-2.5 flex flex-wrap gap-1">
                        {struct.fields.map(field => (
                          <span key={field} className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
                            {field}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Reponse libre ho an'ny structure */}
              <div className="bg-slate-950/40 p-4 rounded-2xl border border-slate-850 space-y-3">
                <label className="text-slate-300 text-xs font-bold block">
                  Te hampiditra Collection/Table hafa ve ianao? (Reponse Libre)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customStructureName}
                    onChange={(e) => setCustomStructureName(e.target.value)}
                    placeholder="Ohatra: reviews na events na settings..."
                    className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 placeholder-slate-600 rounded-xl px-4 py-2.5 text-xs focus:border-sky-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomStructure}
                    className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all active:scale-95 shrink-0"
                  >
                    Ampidiro
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: SECRETS / ENV KEY INPUTS */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h4 className="text-white text-sm font-bold uppercase tracking-wider">Hampidiro ny Secrets / API Keys soa aman-tsara</h4>
                <p className="text-slate-400 text-xs">
                  Ny API keys dia mbola azo asiana placeholder raha mbola eo am-panamboarana ianao. Rehefa vita dia atsofohy ao amin'ny <span className="font-semibold text-sky-400">Settings &gt; Secrets</span> eo amin'ny farany ambony ankavanan'ny AI Studio mba tsy ho hita public.
                </p>
              </div>

              {provider === "Firebase" ? (
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">VITE_FIREBASE_API_KEY</label>
                    <input
                      type="text"
                      value={fbApiKey}
                      onChange={(e) => setFbApiKey(e.target.value)}
                      placeholder="AIzaSyA1..."
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">VITE_FIREBASE_AUTH_DOMAIN</label>
                    <input
                      type="text"
                      value={fbAuthDomain}
                      onChange={(e) => setFbAuthDomain(e.target.value)}
                      placeholder="ohatra-tetikasa.firebaseapp.com"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">VITE_FIREBASE_PROJECT_ID</label>
                    <input
                      type="text"
                      value={fbProjectId}
                      onChange={(e) => setFbProjectId(e.target.value)}
                      placeholder="ohatra-tetikasa"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">VITE_FIREBASE_STORAGE_BUCKET</label>
                    <input
                      type="text"
                      value={fbStorageBucket}
                      onChange={(e) => setFbStorageBucket(e.target.value)}
                      placeholder="ohatra-tetikasa.appspot.com"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">VITE_FIREBASE_MESSAGING_SENDER_ID</label>
                    <input
                      type="text"
                      value={fbMessagingSenderId}
                      onChange={(e) => setFbMessagingSenderId(e.target.value)}
                      placeholder="1234567890"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">VITE_FIREBASE_APP_ID</label>
                    <input
                      type="text"
                      value={fbAppId}
                      onChange={(e) => setFbAppId(e.target.value)}
                      placeholder="1:1234:web:abcd"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">VITE_SUPABASE_URL</label>
                    <input
                      type="text"
                      value={sbUrl}
                      onChange={(e) => setSbUrl(e.target.value)}
                      placeholder="https://ohatra.supabase.co"
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-slate-400 text-[11px] font-bold uppercase tracking-wider block">VITE_SUPABASE_ANON_KEY</label>
                    <input
                      type="text"
                      value={sbAnonKey}
                      onChange={(e) => setSbAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full bg-slate-950 border border-slate-850 text-slate-100 placeholder-slate-700 rounded-xl px-4 py-3 text-xs focus:border-sky-500 outline-none transition-all"
                    />
                  </div>
                </div>
              )}

              {/* Secure statement card */}
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex gap-3 text-emerald-400 text-xs">
                <ShieldCheck className="w-5 h-5 shrink-0" />
                <div>
                  <h6 className="font-bold text-slate-200 mb-0.5">Toro-hevitra momba ny tsiambaratelo</h6>
                  <p className="font-sans leading-relaxed text-slate-400">
                    Ny fampidirana mampiasa <code className="text-emerald-300 font-bold">VITE_</code> prefix dia ahafahan'ny React ao amin'ny navigateur mamaky azy. Ho fampiharana azo antoka kokoa amin'ny production, dia manome soso-kevitra izahay hametraka ny fifandraisana amin'ny alalan'ny Server-Side proxy (ohatra ny API route ao amin'ny server mampiasa <code className="text-emerald-300">process.env</code> tsy misy prefix VITE_).
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: GENERATED CODE OUTPUT */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="space-y-1.5">
                <h4 className="text-white text-sm font-bold uppercase tracking-wider">Tafatsangana soa aman-tsara ny kaody fampifandraisana!</h4>
                <p className="text-slate-400 text-xs">Ireto ny kaody vokarina ho an'ny tetikasanao mivantana. Azonao adika mivantana na ampiharina avy hatrany.</p>
              </div>

              {/* Env File Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-sky-400" />
                    .env (Atsofohy ao anaty fanovana)
                  </span>
                  <button
                    onClick={() => handleCopy(generateEnvTemplate(), "env")}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors text-xs font-semibold bg-slate-800 px-2 py-1 rounded"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText === "env" ? "Voadika!" : "Adikao"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-amber-300 overflow-x-auto border border-slate-850 max-h-[140px]">
                  {generateEnvTemplate()}
                </pre>
              </div>

              {/* Code File Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-slate-400 flex items-center gap-1.5">
                    <Code className="w-3.5 h-3.5 text-sky-400" />
                    {provider === "Firebase" ? "src/firebase_connection.ts" : "src/supabase_connection.ts"}
                  </span>
                  <button
                    onClick={() => handleCopy(codeString, "code")}
                    className="flex items-center gap-1 text-sky-400 hover:text-sky-300 transition-colors text-xs font-semibold bg-slate-800 px-2 py-1 rounded"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedText === "code" ? "Voadika!" : "Adikao"}</span>
                  </button>
                </div>
                <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-slate-300 overflow-x-auto border border-slate-850 max-h-[220px] overflow-y-auto">
                  {codeString}
                </pre>
              </div>

              {/* SQL script only for Supabase */}
              {provider === "Supabase" && sqlString && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-slate-400 flex items-center gap-1.5">
                      <Database className="w-3.5 h-3.5 text-emerald-400" />
                      Supabase SQL Schema (Atsofohy ao amin'ny SQL Editor ao amin'ny Supabase)
                    </span>
                    <button
                      onClick={() => handleCopy(sqlString, "sql")}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors text-xs font-semibold bg-slate-800 px-2 py-1 rounded"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedText === "sql" ? "Voadika!" : "Adikao"}</span>
                    </button>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 font-mono text-[11px] text-emerald-400 overflow-x-auto border border-slate-850 max-h-[140px] overflow-y-auto">
                    {sqlString}
                  </pre>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Navigation */}
        <div className="p-6 border-t border-slate-800/85 bg-slate-950/40 flex justify-between items-center">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700/60 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
                Miverina
              </button>
            ) : (
              <div />
            )}
          </div>

          <div className="flex items-center gap-3">
            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-sky-500/10 active:scale-95"
              >
                Manaraka
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleApplyToApp}
                className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/15 active:scale-95"
              >
                <Sparkles className="w-4 h-4" />
                Ampiharo ao amin'ny App
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
