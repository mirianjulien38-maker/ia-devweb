import React, { useState, useEffect } from "react";
import { X, ShieldCheck, Key, CreditCard, RefreshCw, Check, AlertCircle, Loader2, Save, Users, Layers, TrendingUp } from "lucide-react";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  adminEmail: string;
  onTriggerUserSync?: () => void; // call to refresh current user's credits if changed
}

export default function AdminModal({ isOpen, onClose, adminEmail, onTriggerUserSync }: AdminModalProps) {
  const [activeTab, setActiveTab] = useState<"api-keys" | "payments" | "users-list">("api-keys");
  const [keysInput, setKeysInput] = useState("");
  const [stats, setStats] = useState<{
    users: any[];
    payments: any[];
    geminiKeys: string[];
    currentKeyIndex: number;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/admin/dashboard-stats?adminEmail=${encodeURIComponent(adminEmail)}`);
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Tsy nahazoana alalana na nisy olana.");
      }
      setStats(data);
      setKeysInput(data.geminiKeys.join("\n"));
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Save the custom Gemini API keys
  const handleSaveKeys = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const keysArray = keysInput.split("\n").map(k => k.trim()).filter(k => k.length > 0);

    try {
      const response = await fetch("/api/admin/save-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          keys: keysArray
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Tsy nahomby ny fitahirizana.");
      }

      setSuccessMsg(data.message);
      await fetchStats();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Approve payment
  const handleApprovePayment = async (paymentId: string) => {
    setActionLoading(paymentId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/admin/payments/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, paymentId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Fahadisoana teo am-pankatoavana.");
      }

      setSuccessMsg(data.message);
      if (onTriggerUserSync) onTriggerUserSync();
      await fetchStats();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Reject payment
  const handleRejectPayment = async (paymentId: string) => {
    setActionLoading(paymentId);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/admin/payments/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adminEmail, paymentId }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Fahadisoana teo am-pandavana.");
      }

      setSuccessMsg(data.message);
      await fetchStats();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-sky-400 animate-pulse" />
            <div>
              <h3 className="font-sans font-extrabold text-lg text-white">ADMINISTRATOR CONTROL DESK</h3>
              <p className="text-slate-400 text-xs">Ity faritra ity dia natokana ho an'i <span className="text-sky-300 font-mono">{adminEmail}</span> ihany.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-slate-950/50 border-b border-slate-800/80 px-4 py-1.5 shrink-0 gap-1.5 select-none text-xs">
          <button
            onClick={() => setActiveTab("api-keys")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
              activeTab === "api-keys"
                ? "bg-slate-800 text-sky-400 border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Key className="w-4 h-4" />
            Gemini Keys Rotation ({stats?.geminiKeys.length || 0})
          </button>
          
          <button
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
              activeTab === "payments"
                ? "bg-slate-800 text-sky-400 border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            Recharge Claims ({stats?.payments.filter(p => p.status === "pending").length || 0} Pending)
          </button>

          <button
            onClick={() => setActiveTab("users-list")}
            className={`flex items-center gap-2 py-2 px-4 rounded-xl font-bold uppercase tracking-wider transition-all ${
              activeTab === "users-list"
                ? "bg-slate-800 text-sky-400 border border-slate-700/60"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" />
            Registered Members ({stats?.users.length || 0})
          </button>

          <button
            onClick={fetchStats}
            className="ml-auto p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Notification overlays inside Admin panel */}
        {successMsg && (
          <div className="mx-6 mt-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs py-2.5 px-4 rounded-xl flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="text-[10px] font-bold underline hover:no-underline">Hanafoana</button>
          </div>
        )}
        {errorMsg && (
          <div className="mx-6 mt-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs py-2.5 px-4 rounded-xl flex items-center justify-between">
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-[10px] font-bold underline hover:no-underline">Hanafoana</button>
          </div>
        )}

        {/* Panel Main Area */}
        <div className="p-6 overflow-y-auto flex-1 min-h-[400px]">
          
          {loading && !stats ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
              <p className="text-xs font-semibold">Mampiditra ny rakitra mivantana...</p>
            </div>
          ) : (
            <>
              {/* TAB 1: GEMINI KEYS ROTATION MANAGER */}
              {activeTab === "api-keys" && (
                <div className="space-y-4">
                  <div className="bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-sky-400" />
                        FITANTANANA ARY ROTATION GEMINI API KEYS
                      </h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Ampidiro eto avokoa ireo API keys rehetra mampandeha ny tranonkala (1 key isaky ny andalana).
                        Zakan'ny rafitra na dia keys mihoatra ny 1000 aza.
                      </p>
                    </div>
                    <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-xl text-center min-w-[120px]">
                      <span className="text-[10px] text-slate-400 font-bold block uppercase">Index Rotation</span>
                      <span className="text-lg font-mono font-black text-sky-400">{stats?.currentKeyIndex || 0}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Lisitry ny API Keys (Bulk Paste - Andalana 1 isaky ny Key):</label>
                    <textarea
                      rows={10}
                      placeholder="AIzaSy...&#10;AIzaSy...&#10;AIzaSy..."
                      value={keysInput}
                      onChange={(e) => setKeysInput(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-sky-500 rounded-2xl text-xs font-mono focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-slate-100 placeholder-slate-700 transition-all leading-relaxed"
                    />
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <div className="text-xs text-slate-400 font-semibold font-mono">
                      API Keys voasivana ho voatahiry: <span className="text-white">{keysInput.split("\n").filter(k => k.trim().length > 0).length}</span>
                    </div>
                    <button
                      onClick={handleSaveKeys}
                      disabled={loading}
                      className="py-2.5 px-5 bg-sky-500 hover:bg-sky-400 disabled:bg-sky-500/50 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-sky-500/10 active:scale-95"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      <span>Tehirizo ireo Keys</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PAYMENTS VERIFICATION PANEL */}
              {activeTab === "payments" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Ireo fangatahana verification de paiement</h4>
                    <span className="bg-slate-800 text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md font-mono">
                      Total: {stats?.payments.length || 0} claims
                    </span>
                  </div>

                  {stats?.payments && stats.payments.length === 0 ? (
                    <div className="bg-slate-950/30 border border-slate-800 border-dashed rounded-3xl py-14 px-4 text-center text-slate-500">
                      <CreditCard className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                      <p className="text-xs font-bold uppercase tracking-wide">Tsy misy fandoavam-bola voaray hatreto</p>
                      <p className="text-[11px] text-slate-600 mt-1">Ireo fangatahan'ny mpanjifa dia hiseho eto mba hodinihina.</p>
                    </div>
                  ) : (
                    <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/30">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                          <thead>
                            <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                              <th className="p-3.5">User / Email</th>
                              <th className="p-3.5">Plan / Vidiny</th>
                              <th className="p-3.5">Award Credits</th>
                              <th className="p-3.5">Sender Phone</th>
                              <th className="p-3.5">Transaction Ref</th>
                              <th className="p-3.5">Date Created</th>
                              <th className="p-3.5">Status</th>
                              <th className="p-3.5 text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {stats?.payments.slice().reverse().map((p: any) => (
                              <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-3.5">
                                  <div className="font-bold text-white max-w-[120px] truncate" title={p.userName}>{p.userName}</div>
                                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">{p.userEmail}</div>
                                </td>
                                <td className="p-3.5 font-bold text-slate-200">
                                  {p.plan === "10000ar" ? "10,000ar" : p.plan === "20000ar" ? "20,000ar" : "50,000ar"}
                                </td>
                                <td className="p-3.5 font-mono font-bold text-sky-400">
                                  +{p.creditsToAward}
                                </td>
                                <td className="p-3.5 font-mono text-slate-300">{p.senderPhone}</td>
                                <td className="p-3.5 font-mono text-white font-bold select-all">{p.transactionRef}</td>
                                <td className="p-3.5 text-slate-400 font-mono text-[10px]">
                                  {new Date(p.createdAt).toLocaleString()}
                                </td>
                                <td className="p-3.5">
                                  {p.status === "pending" && (
                                    <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Miandry
                                    </span>
                                  )}
                                  {p.status === "approved" && (
                                    <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Nekena
                                    </span>
                                  )}
                                  {p.status === "rejected" && (
                                    <span className="bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      Nolavina
                                    </span>
                                  )}
                                </td>
                                <td className="p-3.5 text-right whitespace-nowrap">
                                  {p.status === "pending" ? (
                                    <div className="flex gap-1.5 justify-end">
                                      <button
                                        onClick={() => handleApprovePayment(p.id)}
                                        disabled={actionLoading !== null}
                                        className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-[10px] text-white font-bold uppercase rounded-lg transition-all active:scale-95"
                                        title="Onkina / Approve"
                                      >
                                        {actionLoading === p.id ? "..." : "Onkina"}
                                      </button>
                                      <button
                                        onClick={() => handleRejectPayment(p.id)}
                                        disabled={actionLoading !== null}
                                        className="py-1 px-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-[10px] text-white font-bold uppercase rounded-lg transition-all active:scale-95"
                                        title="Lavina / Reject"
                                      >
                                        {actionLoading === p.id ? "..." : "Lavina"}
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-[10px] text-slate-500 font-bold uppercase">Vita</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: REGISTERED USERS LIST */}
              {activeTab === "users-list" && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Ireo mpikambana rehetra voasoratra anarana</h4>
                    <span className="bg-slate-800 text-[10px] text-slate-400 font-bold px-2 py-0.5 rounded-md font-mono">
                      Total: {stats?.users.length || 0} members
                    </span>
                  </div>

                  <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/30">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold">
                          <th className="p-3.5">User ID</th>
                          <th className="p-3.5">Name</th>
                          <th className="p-3.5">Email</th>
                          <th className="p-3.5">Current Credits</th>
                          <th className="p-3.5">Tokens Used</th>
                          <th className="p-3.5 text-right">Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {stats?.users.map((u: any) => (
                          <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                            <td className="p-3.5 font-mono text-slate-500 text-[10px]">{u.id}</td>
                            <td className="p-3.5 font-bold text-white">{u.name}</td>
                            <td className="p-3.5 font-mono text-slate-300">{u.email}</td>
                            <td className="p-3.5 font-mono font-bold text-sky-400">{u.credits}</td>
                            <td className="p-3.5 font-mono text-slate-400">{u.tokensUsed.toLocaleString()} tokens</td>
                            <td className="p-3.5 text-right">
                              {u.email === "horlandobe@gmail.com" ? (
                                <span className="bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">Admin</span>
                              ) : (
                                <span className="text-slate-500 text-[10px] font-bold uppercase">Member</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            Hidio
          </button>
        </div>

      </div>
    </div>
  );
}
