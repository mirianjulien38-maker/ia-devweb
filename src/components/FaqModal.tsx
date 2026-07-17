import React, { useState } from "react";
import { X, HelpCircle, BookOpen, ChevronDown, ChevronUp, Sparkles, MessageSquare, Database, Coins, Shield, ExternalLink, HelpCircle as QuestionIcon } from "lucide-react";
import { Language } from "../translations";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

interface FaqItem {
  question: Record<Language, string>;
  answer: Record<Language, string>;
  category: "general" | "credits" | "database" | "export";
  icon: any;
}

export default function FaqModal({ isOpen, onClose, language }: FaqModalProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | "general" | "credits" | "database" | "export">("all");
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs: FaqItem[] = [
    {
      category: "general",
      icon: MessageSquare,
      question: {
        mg: "Inona no atao hoe DevWeb IA ary ahoana no fiasany?",
        fr: "Qu'est-ce que DevWeb IA et comment ça fonctionne ?",
        en: "What is DevWeb AI and how does it work?"
      },
      answer: {
        mg: "DevWeb IA dia sehatra mamorona sy manova tranonkala ho azy amin'ny alalan'ny AI. Manoratra fotsiny ianao hoe inona ny tranonkala tianao (ohatra: 'Restaurant GastroArt misy menu sy formulaire de reservation'), dia ny AI no mamorona ny kaody HTML/CSS ary mampiseho azy mivantana aminao ao amin'ny preview. Azonao ovaina ihany koa ilay izy amin'ny alalan'ny chat.",
        fr: "DevWeb IA est une plateforme de création et de modification automatique de sites web grâce à l'IA. Saisissez simplement ce que vous désirez (ex: 'Un restaurant GastroArt avec menu et formulaire de réservation'), et l'IA génère le code HTML/CSS de manière autonome puis l'affiche directement en temps réel. Vous pouvez également affiner le résultat via le chat.",
        en: "DevWeb AI is an automated website creation and modification platform powered by AI. Just type what you want (e.g., 'GastroArt restaurant with a menu and reservation form'), and the AI will autonomously generate the HTML/CSS code and display it instantly in the live preview. You can continue refining it using the chat."
      }
    },
    {
      category: "credits",
      icon: Coins,
      question: {
        mg: "Ahoana no ahazoana Credits na fenoana fahana?",
        fr: "Comment obtenir des Crédits ou recharger son compte ?",
        en: "How do I get Credits or top up my account?"
      },
      answer: {
        mg: "Misy fomba roa ahazoana credits: \n1. **Bonus Maimaim-poana**: Ao amin'ny pejy Recharge, afaka mangataka 'Bonus Gratuit' (10 credits isaky ny 10 andro) ianao ho fanohanana antsika.\n2. **Fahana Alofana (Mobile Money)**: Misafidy ny Plan mifanaraka aminao ianao (10,000ar hahazoana 150 credits, 20,000ar hahazoana 300 credits, na 50,000ar hahazoana 450 credits). Alefaso amin'ny laharana Mvola/AirtelMoney/OrangeMoney voalaza ao ny vola, ary ampidiro ao amin'ny formulaire ny Reference sy ny findainao mba hanaovanay fankatoavana mivantana.",
        fr: "Il existe deux façons d'obtenir des crédits : \n1. **Bonus Gratuit** : Dans l'onglet de recharge, vous pouvez réclamer un bonus gratuit de 10 crédits tous les 10 jours.\n2. **Recharge Payante (Mobile Money)** : Choisissez le plan qui vous convient (10 000 Ar pour 150 crédits, 20 000 Ar pour 300 crédits, ou 50 000 Ar pour 450 crédits). Envoyez le montant au numéro indiqué puis remplissez le formulaire avec la Référence de transaction pour validation par l'administrateur.",
        en: "There are two ways to get credits: \n1. **Free Bonus**: In the Recharge Modal, you can claim a 10 credits free bonus every 10 days.\n2. **Paid Recharge (Mobile Money)**: Choose your preferred plan (10,000 Ar for 150 credits, 20,000 Ar for 300 credits, or 50,000 Ar for 450 credits). Send the payment to the mobile money number listed, then submit the phone number and transaction reference in the verification form."
      }
    },
    {
      category: "database",
      icon: Database,
      question: {
        mg: "Inona no atao hoe Database Wizard ary ahoana no fampiasana azy?",
        fr: "Qu'est-ce que l'Assistant Database (Wizard) et comment l'utiliser ?",
        en: "What is the Database Wizard and how do I use it?"
      },
      answer: {
        mg: "Ny Database Wizard dia manampy anao hampifandray ny tranonkalanao amin'ny tahiry matanjaka toy ny Firebase na Supabase. Ampidiro fotsiny ny API Keys mifanaraka aminy, dia homenay kaody feno fampifandraisana ianao (fitehirizana formulaire, contact, login, sns.). Ny tsiambaratelonao dia tazonina mivantana ao amin'ny navigateur-nao ho fiarovana azy.",
        fr: "L'Assistant Database vous aide à connecter votre site web à des bases de données robustes comme Firebase ou Supabase. Saisissez simplement vos clés de configuration et nous générerons le code de liaison complet (sauvegarde des formulaires, gestion des contacts, etc.). Vos clés restent stockées de manière sécurisée en local.",
        en: "The Database Wizard helps you connect your custom website to cloud databases like Firebase or Supabase. Simply paste your configuration keys, and we will generate the full connection code for your database actions (saving form submissions, user logins, contact requests). Your credentials stay fully secure in local state."
      }
    },
    {
      category: "export",
      icon: BookOpen,
      question: {
        mg: "Ahoana no isintonana ny tranonkala hovononina ho amin'ny internet?",
        fr: "Comment télécharger et héberger son site web en ligne ?",
        en: "How do I download and host my website live online?"
      },
      answer: {
        mg: "Tsindrio fotsiny ny bokotra 'Ampidino ny HTML' (na 'Télécharger le HTML' / 'Download HTML') eo amin'ny faritry ny Preview. Hahazo rakitra '.html' feno ianao izay misy ny soratra, sary, ary sary mihetsika rehetra. Azonao atao ny mampiantrano azy mivantana maimaim-poana amin'ny sehatra toy ny Netlify, Vercel, na GitHub Pages.",
        fr: "Cliquez simplement sur le bouton 'Télécharger le HTML' dans le coin supérieur de l'aperçu. Vous obtiendrez un fichier autonome contenant l'intégralité du code et du style. Vous pouvez ensuite l'héberger gratuitement sur des services comme Netlify, Vercel ou GitHub Pages.",
        en: "Just click the 'Download HTML File' button inside the Preview section header. You will download a self-contained, high-performance HTML file containing all of your designs, structures, and animations. You can host this file for free on platforms like Netlify, Vercel, or GitHub Pages."
      }
    }
  ];

  const filteredFaqs = activeCategory === "all" ? faqs : faqs.filter(f => f.category === activeCategory);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const getCategoryLabel = (cat: string) => {
    switch (cat) {
      case "general": return language === "mg" ? "Ankapobeny" : language === "fr" ? "Général" : "General";
      case "credits": return language === "mg" ? "Credits & Recharge" : language === "fr" ? "Crédits & Paiements" : "Credits & Payments";
      case "database": return language === "mg" ? "Database & Wizard" : language === "fr" ? "Base de Données" : "Database & Integrations";
      case "export": return language === "mg" ? "Hosing & Export" : language === "fr" ? "Hébergement & Export" : "Hosting & Production";
      default: return "";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto font-sans text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-sky-400" />
            <div>
              <h3 className="font-sans font-extrabold text-lg text-white">
                {language === "mg" ? "FAQ & TARATASY FANOROA" : language === "fr" ? "FAQ & DOCUMENTS PROFESSIONNELS" : "FAQ & DOCUMENTATION"}
              </h3>
              <p className="text-slate-400 text-xs">
                {language === "mg" ? "Torolalana matihanina hampandehanana ny tetikasanao" : language === "fr" ? "Guides professionnels pour réussir vos projets" : "Professional tutorials to build and deploy your app successfully"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Categories selector */}
        <div className="flex flex-wrap gap-2 px-6 py-3 bg-slate-950/40 border-b border-slate-800 shrink-0">
          <button
            onClick={() => { setActiveCategory("all"); setOpenIndex(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeCategory === "all" ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
            }`}
          >
            {language === "mg" ? "Rehetra" : language === "fr" ? "Tout" : "All"}
          </button>
          {(["general", "credits", "database", "export"] as const).map(cat => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setOpenIndex(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeCategory === cat ? "bg-sky-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200"
              }`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Quick Start Card */}
          <div className="bg-gradient-to-r from-sky-500/10 to-indigo-500/10 border border-sky-500/15 rounded-2xl p-5">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-sky-400" />
              {language === "mg" ? "Dingana 3 fampiasana an'i DevWeb IA :" : language === "fr" ? "3 étapes simples d'utilisation :" : "3 simple steps to get started :"}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-sky-400 font-bold font-mono block mb-1">01 / Prompt</span>
                <p className="text-slate-300 leading-relaxed">
                  {language === "mg" ? "Soraty ny filanao (ohatra: design mampitolagaga, responsive, menu milay)." : language === "fr" ? "Décrivez votre besoin (style, structure, animations)." : "Describe your custom requirements (styling, menus, sections)."}
                </p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-sky-400 font-bold font-mono block mb-1">02 / Preview</span>
                <p className="text-slate-300 leading-relaxed">
                  {language === "mg" ? "Jereo mivantana ao amin'ny Preview ny vokatra ary ampanovay eo no ho eo." : language === "fr" ? "Visualisez instantanément le résultat interactif dans l'aperçu." : "Instantly view the interactive designs inside the Live Preview."}
                </p>
              </div>
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/60">
                <span className="text-sky-400 font-bold font-mono block mb-1">03 / Export</span>
                <p className="text-slate-300 leading-relaxed">
                  {language === "mg" ? "Isintony maimaim-poana ny rakitra HTML ka ampiasao mivantana eny amin'ny internet." : language === "fr" ? "Téléchargez gratuitement le code HTML pour l'héberger où vous voulez." : "Download the complete code for free and host it anywhere in the world."}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Accordion Accordions */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">
              {language === "mg" ? "Fanontaniana Matetika Rehetra" : language === "fr" ? "Questions Fréquemment Posées" : "Frequently Asked Questions"}
            </h4>

            {filteredFaqs.map((faq, idx) => {
              const Icon = faq.icon;
              const isOpen = openIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-2xl transition-all overflow-hidden ${
                    isOpen ? "bg-slate-950/40 border-slate-700/80" : "bg-slate-900/50 border-slate-800/60 hover:border-slate-700/60"
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full flex justify-between items-center px-5 py-4 text-left transition-colors font-semibold text-xs sm:text-sm text-slate-200"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <div className={`p-2 rounded-xl ${isOpen ? "bg-sky-500/10 text-sky-400" : "bg-slate-800/60 text-slate-400"}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="font-bold">{faq.question[language]}</span>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs leading-relaxed text-slate-300 border-t border-slate-800/50 whitespace-pre-line bg-slate-950/20 font-medium">
                      {faq.answer[language]}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex justify-end bg-slate-900/50 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all active:scale-95"
          >
            {language === "mg" ? "Hidio" : language === "fr" ? "Fermer" : "Close"}
          </button>
        </div>

      </div>
    </div>
  );
}
