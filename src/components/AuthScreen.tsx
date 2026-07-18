import React, { useState } from "react";
import { Code2, Mail, Lock, User, ArrowRight, ShieldCheck, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { auth, googleProvider, signInWithPopup } from "../lib/firebase";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  updateProfile 
} from "firebase/auth";

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

    try {
      if (isLogin) {
        // 1. Firebase Authentication sign in
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // 2. Sync / retrieve profile and credits from Express backend
        const response = await fetch("/api/user-status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: firebaseUser.email }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          onAuthSuccess(data.user);
        } else {
          // If the profile is not in server-db yet, auto-create it (fallback)
          const regResponse = await fetch("/api/register", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: firebaseUser.email,
              name: firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Mpampiasa",
              password: "firebase-managed"
            }),
          });
          const regData = await regResponse.json();
          if (regResponse.ok && regData.success) {
            onAuthSuccess(regData.user);
          } else {
            throw new Error("Tsy nahomby ny fampifanarahana ny mombamomba any amin'ny lohamilina.");
          }
        }
      } else {
        // 1. Firebase Authentication registration
        if (password.length < 6) {
          throw new Error("Ny teny miafina dia tokony hanana tarehin-tsoratra 6 farafahakeliny.");
        }
        
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;

        // Update name inside Firebase user profile
        await updateProfile(firebaseUser, { displayName: name });

        // 2. Register profile and credits on backend
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: firebaseUser.email,
            name: name,
            password: "firebase-managed"
          }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          onAuthSuccess(data.user);
        } else {
          // Local fallback in case server was unable to save
          onAuthSuccess({
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: name,
            credits: 15,
            tokensUsed: 0,
            bonusClaimsCount: 0,
            isAdmin: false
          });
        }
      }
    } catch (err: any) {
      let friendlyError = err.message;
      if (err.code === "auth/email-already-in-use") {
        friendlyError = "Efa misy mampiasa io mailaka io.";
      } else if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password" || err.code === "auth/user-not-found") {
        friendlyError = "Diso ny mailaka na ny teny miafina.";
      } else if (err.code === "auth/invalid-email") {
        friendlyError = "Tsy mety io endrika mailaka io.";
      } else if (err.code === "auth/weak-password") {
        friendlyError = "Marefo loatra ny teny miafina (tarehin-tsoratra 6 farafahakeliny).";
      }
      setError(friendlyError);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const firebaseUser = userCredential.user;
      const userEmail = firebaseUser.email;
      if (!userEmail) {
        throw new Error("Tsy nahazoana mailaka avy amin'ny Google Auth.");
      }
      const displayName = firebaseUser.displayName || userEmail.split("@")[0] || "Mpampiasa";

      // Sync or auto-register credits in local server database
      const response = await fetch("/api/user-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      if (response.ok && data.success) {
        onAuthSuccess(data.user);
      } else {
        // Register brand new user with 15 free credits!
        const regResponse = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            name: displayName,
            password: "firebase-managed-google"
          }),
        });
        const regData = await regResponse.json();
        if (regResponse.ok && regData.success) {
          onAuthSuccess(regData.user);
        } else {
          onAuthSuccess({
            id: firebaseUser.uid,
            email: userEmail,
            name: displayName,
            credits: 15,
            tokensUsed: 0,
            bonusClaimsCount: 0,
            isAdmin: false
          });
        }
      }
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Tsy nahomby ny fidirana tamin'ny alàlan'ny Google.");
      }
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

          {/* Divider */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-800/80"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Na ampiasao</span>
            <div className="flex-grow border-t border-slate-800/80"></div>
          </div>

          {/* Google Sign In button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] disabled:cursor-not-allowed hover:border-slate-750"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Fidirana amin'ny Google</span>
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
