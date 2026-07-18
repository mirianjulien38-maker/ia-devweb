import React, { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { 
  Monitor, Tablet, Smartphone, Download, 
  Copy, Check, ExternalLink, RefreshCw, 
  Code2, Eye, Maximize2, Minimize2 
} from "lucide-react";

interface PreviewAreaProps {
  code: string;
  projectName: string;
  isGenerating: boolean;
}

type ViewportSize = "desktop" | "tablet" | "mobile";
type ActiveTab = "preview" | "code";

export default function PreviewArea({ code, projectName, isGenerating }: PreviewAreaProps) {
  const [viewport, setViewport] = useState<ViewportSize>("desktop");
  const [activeTab, setActiveTab] = useState<ActiveTab>("preview");
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Automatically switch to preview tab when code changes (new generation or play preview clicked)
  useEffect(() => {
    if (code) {
      setActiveTab("preview");
    }
  }, [code]);

  // Synchronize iframe reload when code changes
  useEffect(() => {
    if (iframeRef.current && activeTab === "preview") {
      const iframe = iframeRef.current;
      iframe.srcdoc = code;
    }
  }, [code, activeTab]);

  const handleIframeLoad = () => {
    if (!iframeRef.current) return;
    try {
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (!iframeDoc) return;

      // Intercept link clicks inside the iframe to prevent top/relative navigations
      iframeDoc.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const anchor = target.closest("a");
        if (anchor) {
          const href = anchor.getAttribute("href");
          
          // If it's a relative path to the server or empty, or "/" which loads DEVWEBIA, intercept it!
          if (
            href === "/" || 
            href === "" || 
            (href && !href.startsWith("#") && !href.startsWith("http") && !href.startsWith("javascript:") && !href.startsWith("mailto:") && !href.startsWith("tel:"))
          ) {
            e.preventDefault();
            console.log("[DEVWEB Intercept] Blocked navigation inside preview to preserve preview state:", href);
            
            // If it's a target section (hash-like name), try to scroll to it manually
            if (href && href.length > 1 && !href.includes("/") && !href.includes("http")) {
              const cleanedId = href.replace("#", "");
              const targetEl = iframeDoc.getElementById(cleanedId);
              if (targetEl) {
                targetEl.scrollIntoView({ behavior: "smooth" });
              }
            }
          }
        }
      }, true);

      // Intercept form submissions inside the iframe to prevent full page reloads/redirects
      iframeDoc.addEventListener("submit", (e: Event) => {
        const form = e.target as HTMLFormElement;
        const action = form.getAttribute("action");
        if (!action || action === "/" || action === "" || action === window.location.pathname) {
          e.preventDefault();
          console.log("[DEVWEB Intercept] Blocked form submission relative action to preserve preview state.");
        }
      }, true);

    } catch (err) {
      console.warn("Saha fitsapana / find interceptors failed:", err);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadCode = () => {
    const filename = `${projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tranonkala"}.html`;
    const blob = new Blob([code], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadZip = async () => {
    try {
      const zip = new JSZip();
      const folderName = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "tranonkala-ai";
      
      // Add index.html
      zip.file("index.html", code);
      
      // Add informational README.txt
      const readmeContent = `=====================================================
 ${projectName.toUpperCase()} - Tranonkala Noforonin'ny DEVWEBIA
=====================================================

Miarahaba! Ity no tranonkala novoronin'ny mpanampy AI ao amin'ny DEVWEBIA.
Noforonina tamin'ny alalan'ny teknolojia maoderina:
- HTML5 & CSS3
- Tailwind CSS (ho an'ny endrika sy ravaka tsara tarehy)
- JavaScript (ho an'ny "interactivité" sy ny finday)

FOMBA FAMPIASANA AZY:
---------------------
1. Sokafy fotsiny ny rakitra "index.html" mivantana amin'ny navigateur-nao (Chrome, Firefox, Safari, Edge, sns.).
2. Tsy mila "setup" na server manokana izany satria feno (self-contained) ao anatin'ity rakitra ity avokoa ny rafitra rehetra.

MISAOTRA SY MIRARY SOA AMIN'NY FAMPIASANA NY DEVWEBIA!
`;
      zip.file("README.txt", readmeContent);
      
      // Generate Zip
      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${folderName}.zip`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Fahadisoana rehefa nanao zip:", err);
    }
  };

  const handleOpenNewTab = () => {
    const blob = new Blob([code], { type: "text/html;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  };

  const getViewportWidthClass = () => {
    switch (viewport) {
      case "mobile":
        return "max-w-[375px] border-x border-slate-700/80 rounded-2xl shadow-2xl shadow-slate-950/40";
      case "tablet":
        return "max-w-[768px] border-x border-slate-700/60 rounded-2xl shadow-xl shadow-slate-950/20";
      default:
        return "max-w-full";
    }
  };

  return (
    <div className={`flex-1 bg-slate-950 flex flex-col overflow-hidden h-full transition-all duration-300 ${
      isFullscreen ? "fixed inset-0 z-[200] w-screen h-screen p-4" : ""
    }`}>
      {/* Control bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex flex-wrap justify-between items-center gap-3 shrink-0">
        {/* Tab switchers */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab("preview")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "preview"
                ? "bg-slate-800 text-sky-400 shadow-md shadow-slate-950/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Sary Mivantana (Preview)</span>
          </button>
          <button
            onClick={() => setActiveTab("code")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "code"
                ? "bg-slate-800 text-sky-400 shadow-md shadow-slate-950/50"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Kaody HTML (Code)</span>
          </button>
        </div>

        {/* Viewport resizing tools - Only active in Preview Tab */}
        {activeTab === "preview" && (
          <div className="hidden sm:flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800/80 gap-1">
            <button
              onClick={() => setViewport("desktop")}
              className={`p-2 rounded-lg transition-all ${
                viewport === "desktop"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("tablet")}
              className={`p-2 rounded-lg transition-all ${
                viewport === "tablet"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Tablet view"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`p-2 rounded-lg transition-all ${
                viewport === "mobile"
                  ? "bg-slate-800 text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action button tools */}
        {code && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              title="Adikao ny kaody"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Voadika ✓</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Adikao</span>
                </>
              )}
            </button>

            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-sky-500/10 hover:shadow-sky-500/20 active:scale-95"
              title="Hampidina ny fichier ho an'ny fitaovanao"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>

            <button
              onClick={handleDownloadZip}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/10 hover:shadow-emerald-600/20 active:scale-95"
              title="Hampidina ny tranonkala amin'ny endrika ZIP"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ZIP</span>
            </button>

            {activeTab === "preview" && (
              <>
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 p-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  title={isFullscreen ? "Hiala amin'ny Plein écran" : "Hijery Plein écran (Full-screen)"}
                >
                  {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
                </button>
                <button
                  onClick={handleOpenNewTab}
                  className="hidden lg:flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-200 p-2 rounded-xl text-xs font-semibold transition-all active:scale-95"
                  title="Sokafy amin'ny Tab vaovao"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Workspace Display Area */}
      <div className="flex-1 overflow-hidden p-4 flex justify-center items-stretch relative">
        {isGenerating && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center text-center p-6">
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-14 h-14 border-4 border-slate-800 border-t-sky-500 rounded-full animate-spin" />
              <Code2 className="w-5 h-5 text-sky-400 absolute animate-pulse" />
            </div>
            <h4 className="font-sans font-bold text-slate-200 text-base">Manorina ny tranonkalanao ny IA...</h4>
            <p className="text-slate-400 text-xs mt-1.5 max-w-sm">
              Mampiasa algorithm sy fiteny matanjaka indrindra mba hanomezana anao tranonkala tonga lafatra sy responsive.
            </p>
          </div>
        )}

        {!code ? (
          <div className="flex-1 bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center text-center p-8 max-w-3xl mx-auto my-auto h-[400px]">
            <div className="w-16 h-16 bg-slate-800/80 border border-slate-700/50 rounded-2xl flex items-center justify-center mb-4 text-sky-400 shadow-lg">
              <Code2 className="w-8 h-8" />
            </div>
            <h3 className="font-sans font-bold text-slate-200 text-lg">Miarahaba anao ao amin'ny DEVWEB IA!</h3>
            <p className="text-slate-400 text-sm mt-2 max-w-md leading-relaxed">
              Safidio ny iray amin'ireo templates efa vonona eo amin'ny ankavia na soraty ny torolalanao mba hamoronana tranonkala matihanina mivantana.
            </p>
          </div>
        ) : activeTab === "preview" ? (
          <div className={`w-full h-full bg-slate-900 border border-slate-800/80 overflow-hidden flex flex-col transition-all duration-300 ${getViewportWidthClass()}`}>
            {/* Inner responsive frame top bar */}
            <div className="bg-slate-800/80 border-b border-slate-700/40 px-4 py-2 flex justify-between items-center text-[11px] font-mono text-slate-400 shrink-0 select-none">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">
                {viewport === "desktop" ? "100% desktop view" : viewport === "tablet" ? "768px tablet view" : "375px mobile view"}
              </span>
              <div className="w-12" />
            </div>
            {/* Live iframe */}
            <div className="flex-1 bg-white relative">
              <iframe
                key={code}
                ref={iframeRef}
                srcDoc={code}
                title="DEVWEB IA Preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-modals allow-same-origin allow-forms"
                onLoad={handleIframeLoad}
              />
            </div>
          </div>
        ) : (
          /* Code View Mode */
          <div className="w-full max-w-5xl mx-auto h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-850 border-b border-slate-800/80 px-4 py-2.5 flex justify-between items-center text-xs text-slate-400 font-mono shrink-0 select-none">
              <span className="text-sky-400 flex items-center gap-1.5 font-semibold">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                index.html (HTML + Tailwind + JS)
              </span>
              <span>{code.length.toLocaleString()} characters</span>
            </div>
            <pre className="flex-1 overflow-auto p-5 text-slate-300 font-mono text-xs leading-relaxed select-text bg-slate-950/60 selection:bg-sky-500/30 selection:text-white">
              <code>{code}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
