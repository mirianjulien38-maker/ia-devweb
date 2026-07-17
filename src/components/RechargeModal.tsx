import React, { useState } from "react";
import { X, Sparkles, Coins, Phone, User as UserIcon, Check, Copy, ArrowRight, Wallet, HelpCircle, Loader2, RefreshCw } from "lucide-react";

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    email: string;
    name: string;
    credits: number;
    tokensUsed: number;
    bonusClaimsCount: number;
  } | null;
  onUserUpdate: (updatedUser: any) => void;
}

export default function RechargeModal({ isOpen, onClose, user, onUserUpdate }: RechargeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"10000ar" | "20000ar" | "50000ar">("10000ar");
  const [senderPhone, setSenderPhone] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [copied, setCopied] = useState<"phone" | "name" | null>(null);
  
  const [claimLoading, setClaimLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen || !user) return null;

  const paymentNumber = "0323911654";
  const paymentName = "RAVELOMANANTSOA URMIN";

  const handleCopy = (text: string, type: "phone" | "name") => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  // Claim 10 credits free bonus
  const handleClaimBonus = async () => {
    setClaimLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/claim-free-bonus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Tsy nahomby ny fangatahana bonus.");
      }

      setSuccessMsg(data.message);
      onUserUpdate(data.user);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setClaimLoading(false);
    }
  };

  // Submit payment claim to admin
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderPhone || !transactionRef) {
      setErrorMsg("Fenoy avokoa ny saha rehetra azafady.");
      return;
    }

    setSubmitLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const response = await fetch("/api/submit-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          plan: selectedPlan,
          senderPhone,
          transactionRef,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Tsy nahomby ny fandefasana.");
      }

      setSuccessMsg(data.message);
      setSenderPhone("");
      setTransactionRef("");
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const planCredits = {
    "10000ar": 150,
    "20000ar": 300,
    "50000ar": 450,
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <Coins className="w-5 h-5 text-sky-400" />
            <h3 className="font-sans font-extrabold text-lg text-white">FITANTANANA NY FAHANA & NY RECHARGE</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6">
          
          {/* Messages info */}
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs py-3 px-4 rounded-xl">
              {successMsg}
            </div>
          )}
          {errorMsg && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs py-3 px-4 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Current Balance Summary Card */}
          <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/15 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Ny fahananao amin'izao fotoana izao</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-sky-400 font-mono">{user.credits}</span>
                <span className="text-sm text-slate-300 font-semibold">Credits</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                Tokens efa nampiasaina: <span className="text-slate-200">{user.tokensUsed.toLocaleString()} tokens</span>
              </p>
            </div>
            
            {/* Rule info */}
            <div className="bg-slate-950/40 border border-slate-800/40 p-3 rounded-xl max-w-xs text-xs text-slate-300 leading-relaxed">
              <span className="font-bold text-sky-400 block mb-0.5">💰 Fitsipika:</span>
              1 Credit = <span className="font-mono text-white">20,000 Tokens</span>. Mihena tsikelikely araka ny habetsaky ny kaody miforona ny fahananao.
            </div>
          </div>

          {/* Grid section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Claim Free Bonus & Payment Details */}
            <div className="space-y-6">
              
              {/* Free monthly bonus */}
              <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">Bonus Gratuit (30 Credits / Volana)</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Ho an'ny mpanjifa gratuit dia mahazo bonus **10 credits** isaky ny 10 andro (In-3 isam-bolana maximum = 30 credits).
                </p>

                <div className="flex items-center justify-between mb-4 bg-slate-900/60 p-2.5 border border-slate-800/60 rounded-xl text-xs">
                  <span className="text-slate-400 font-medium">Fangatahana efa natao:</span>
                  <span className="font-bold text-white font-mono">{user.bonusClaimsCount} / 3</span>
                </div>

                <button
                  onClick={handleClaimBonus}
                  disabled={claimLoading || user.bonusClaimsCount >= 3}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 text-white disabled:text-slate-500 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  {claimLoading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <>
                      <span>Mangataka Bonus (10 Credits)</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {/* Payment Info */}
              <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Wallet className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider font-sans">LAHARANA HANDOAVANA VOLA</h4>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Alefaso amin'ity laharana mobile money manaraka ity ny sarany mifanaraka amin'ny plan tianao, diafenoy ny form eo ankavanana mba hahazoana ny fahanao.
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between bg-slate-900/60 py-2 px-3 rounded-lg border border-slate-800/40">
                    <span className="text-slate-400">Laharana:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-white font-bold select-all">{paymentNumber}</span>
                      <button
                        onClick={() => handleCopy(paymentNumber, "phone")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Copy Number"
                      >
                        {copied === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-slate-900/60 py-2 px-3 rounded-lg border border-slate-800/40">
                    <span className="text-slate-400">Anarana:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-white font-semibold text-right max-w-[140px] truncate">{paymentName}</span>
                      <button
                        onClick={() => handleCopy(paymentName, "name")}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"
                        title="Copy Name"
                      >
                        {copied === "name" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Col: Plans selection & Verification claim form */}
            <div className="bg-slate-950/30 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Check className="w-4 h-4 text-sky-400" />
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">1. HITADY PLAN & FANDOAVAM-BOLA</h4>
                </div>

                {/* Plan grids */}
                <div className="grid grid-cols-1 gap-2.5 mb-5">
                  <button
                    type="button"
                    onClick={() => setSelectedPlan("10000ar")}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedPlan === "10000ar"
                        ? "bg-sky-500/10 border-sky-500"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-300">PLAN START</span>
                      <p className="text-lg font-black text-white mt-0.5">10,000 Ariary</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-500/20 font-mono">
                        +150 Credits
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("20000ar")}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedPlan === "20000ar"
                        ? "bg-sky-500/10 border-sky-500"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-300">PLAN PRO</span>
                      <p className="text-lg font-black text-white mt-0.5">20,000 Ariary</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-500/20 font-mono">
                        +300 Credits
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan("50000ar")}
                    className={`p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedPlan === "50000ar"
                        ? "bg-sky-500/10 border-sky-500"
                        : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-300">PLAN ENTERPRISE</span>
                      <p className="text-lg font-black text-white mt-0.5">50,000 Ariary</p>
                    </div>
                    <div className="text-right">
                      <span className="bg-sky-500/20 text-sky-400 text-xs font-bold px-2.5 py-1 rounded-full border border-sky-500/20 font-mono">
                        +450 Credits
                      </span>
                    </div>
                  </button>
                </div>

                {/* Verification Claim Form */}
                <div className="border-t border-slate-800/80 pt-4">
                  <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider mb-3">2. ALEFASO NY FANAMARINANA</h4>
                  <form onSubmit={handleSubmitPayment} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Laharana nandefasana azy (Sender Phone)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ohatra: 0340000000"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-white font-medium placeholder-slate-600"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reference fandoavam-bola (Mvola Ref / SMS Ref)</label>
                      <input
                        type="text"
                        required
                        placeholder="Ohatra: 14930193"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-950/50 border border-slate-800 focus:border-sky-500 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-sky-500/50 text-white font-medium placeholder-slate-600"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="w-full mt-3 py-2.5 bg-sky-500 hover:bg-sky-400 text-white disabled:bg-sky-500/40 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      {submitLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <span>Alefaso ny Fanaporofoana</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </div>

          </div>

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
