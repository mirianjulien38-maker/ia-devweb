import React, { useState } from "react";
import { Code2, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Loader2, AlertCircle } from "lucide-react";

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isLogin ? "/api/login" : "/api/register";
    const payload = isLogin ? { email, password } : { email, name, password };

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Nisy olana nitranga. Manandrama indray.");
      }

      // Success!
      onAuthSuccess(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans text-slate-100 selection:bg-sky-500/30">
      
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 shadow-2xl relative z-10">
        
        {/* App Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-gradient-to-tr from-sky-500 to-indigo-600 p-3.5 rounded-2xl shadow-xl shadow-sky-500/10 flex items-center justify-center mb-4 active:scale-95 transition-transform duration-200">
            <Code2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tight text-white uppercase flex items-center gap-1.5">
            DevWeb <span className="text-sky-400">IA</span>
          </h1>
          <p className="text-slate-400 text-xs mt-1.5 text-center px-4 leading-relaxed font-medium">
            Fidirana matihanina amin'ny sehatra famoronana tranonkala amin'ny alalan'ny AI
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-5 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs py-3 px-4 rounded-xl flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Anarana feno</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  placeholder="Rakoto Be"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-white placeholder-slate-600 transition-all font-medium"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mailaka (Email)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                placeholder="ohatra@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-white placeholder-slate-600 transition-all font-medium"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Teny miafina (Password)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-white placeholder-slate-600 transition-all font-medium"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 py-3.5 px-4 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/40 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-sky-500/15 flex items-center justify-center gap-2 active:scale-[0.98] disabled:cursor-not-allowed hover:shadow-sky-500/25"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isLogin ? (
              <>
                <span>Hidirana</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Hisoratra anarana</span>
                <Sparkles className="w-4 h-4 text-white" />
              </>
            )}
          </button>
        </form>

        {/* Registration/Login toggler */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 text-center text-xs font-medium text-slate-400">
          {isLogin ? (
            <p>
              Mbola tsy manana kaonty?{" "}
              <button
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className="text-sky-400 hover:text-sky-300 transition-colors font-bold ml-1 hover:underline"
              >
                Misoratra anarana eto (Maimaim-poana)
              </button>
            </p>
          ) : (
            <p>
              Efa manana kaonty ve ianao?{" "}
              <button
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className="text-sky-400 hover:text-sky-300 transition-colors font-bold ml-1 hover:underline"
              >
                Midira eto
              </button>
            </p>
          )}
        </div>

        {/* Free gift disclaimer */}
        {!isLogin && (
          <div className="mt-4 bg-emerald-500/5 border border-emerald-500/10 py-2.5 px-3 rounded-lg text-[11px] text-emerald-400/90 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Mahazo **15 Credits maimaim-poana** avy hatrany ianao!</span>
          </div>
        )}

      </div>
    </div>
  );
}
