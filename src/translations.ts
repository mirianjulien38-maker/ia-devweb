export type Language = "mg" | "fr" | "en";

export interface TranslationSet {
  brandTitle: string;
  brandSlogan: string;
  badgePro: string;
  newWebsite: string;
  credits: string;
  adminPanel: string;
  logout: string;
  currentProject: string;
  activeProject: string;
  newProjectPlaceholder: string;
  createdOn: string;
  open: string;
  deleteProj: string;
  myWebsites: string;
  noWebsitesYet: string;
  noWebsitesDesc: string;
  errorTitle: string;
  close: string;
  collapseSidebar: string;
  expandSidebar: string;
  builderTab: string;
  previewTab: string;
  creditsRemaining: string;
  activeStatus: string;
  buyCredits: string;
  faqAndDocs: string;
  support: string;
  chatPlaceholder: string;
  send: string;
  refineInstruction: string;
  refineExplain: string;
  selectCode: string;
  copied: string;
  copy: string;
  downloadHtml: string;
  previewLive: string;
  databaseWizard: string;
}

export const translations: Record<Language, TranslationSet> = {
  mg: {
    brandTitle: "DevWeb IA",
    brandSlogan: "Mpamorona Tranonkala Matihanina miaraka amin'ny AI sy Preview Mivantana",
    badgePro: "Mpanorina Pro",
    newWebsite: "Tranonkala Vaovao",
    credits: "Credits",
    adminPanel: "Admin Panel",
    logout: "Hivoaka",
    currentProject: "Lohahevitra miasa:",
    activeProject: "Tranonkala vaovao (Manorata prompt)",
    newProjectPlaceholder: "Mamorona tranonkala vaovao...",
    createdOn: "Voaforona tamin'ny:",
    open: "Sokafy",
    deleteProj: "Fafao ity tranonkala ity",
    myWebsites: "Ny Tranonkalanao Rehetra",
    noWebsitesYet: "Mbola tsy nisy tranonkala voaforona.",
    noWebsitesDesc: "Ampiasao ny sidebar hamoronana ny tranonkala voalohany anao!",
    errorTitle: "Nisy Fahadisoana",
    close: "Hidio",
    collapseSidebar: "Hanafoana sidebar",
    expandSidebar: "Hampiseho sidebar",
    builderTab: "Mpamorona (Builder)",
    previewTab: "Sary Mivantana (Preview)",
    creditsRemaining: "Credits sisa",
    activeStatus: "Mandeha",
    buyCredits: "Mividy / Recharge",
    faqAndDocs: "FAQ & Taratasy Fanoroana",
    support: "Fanampiana (WhatsApp)",
    chatPlaceholder: "Inona no karazana tranonkala tianao hamboarina?",
    send: "Alefaso",
    refineInstruction: "Te-hanova zavatra ve ianao?",
    refineExplain: "Soraty eto ny fanitsiana tianao hatao amin'ny tranonkalanao.",
    selectCode: "Ampiasao ity kaody ity",
    copied: "Kopia voaray",
    copy: "Adikao ny kaody",
    downloadHtml: "Ampidino ny HTML",
    previewLive: "Sary mivantana",
    databaseWizard: "Database Wizard",
  },
  fr: {
    brandTitle: "DevWeb IA",
    brandSlogan: "Créateur de sites web professionnel avec IA et aperçu en temps réel",
    badgePro: "Bâtisseur Pro",
    newWebsite: "Nouveau Site",
    credits: "Crédits",
    adminPanel: "Panneau Admin",
    logout: "Déconnexion",
    currentProject: "Sujet de travail :",
    activeProject: "Nouveau projet (Écrivez un prompt)",
    newProjectPlaceholder: "Créer un nouveau site...",
    createdOn: "Créé le :",
    open: "Ouvrir",
    deleteProj: "Supprimer ce projet",
    myWebsites: "Tous Vos Projets Web",
    noWebsitesYet: "Aucun site web n'a encore été créé.",
    noWebsitesDesc: "Utilisez la barre latérale pour concevoir votre premier site !",
    errorTitle: "Une Erreur est Survenue",
    close: "Fermer",
    collapseSidebar: "Réduire la barre latérale",
    expandSidebar: "Développer la barre latérale",
    builderTab: "Constructeur (Builder)",
    previewTab: "Aperçu en Direct",
    creditsRemaining: "Crédits restants",
    activeStatus: "Actif",
    buyCredits: "Acheter / Recharger",
    faqAndDocs: "FAQ & Documents",
    support: "Assistance (WhatsApp)",
    chatPlaceholder: "Quel type de site web souhaitez-vous concevoir ?",
    send: "Envoyer",
    refineInstruction: "Vous souhaitez modifier quelque chose ?",
    refineExplain: "Écrivez ici les modifications ou corrections à apporter à votre site.",
    selectCode: "Utiliser ce code",
    copied: "Copié !",
    copy: "Copier le code",
    downloadHtml: "Télécharger le HTML",
    previewLive: "Aperçu en direct",
    databaseWizard: "Assistant BDD",
  },
  en: {
    brandTitle: "DevWeb AI",
    brandSlogan: "Professional website builder with AI and live interactive preview",
    badgePro: "Builder Pro",
    newWebsite: "New Website",
    credits: "Credits",
    adminPanel: "Admin Panel",
    logout: "Logout",
    currentProject: "Active Project:",
    activeProject: "New website project (Write a prompt)",
    newProjectPlaceholder: "Create a new website...",
    createdOn: "Created on:",
    open: "Open",
    deleteProj: "Delete this website",
    myWebsites: "All Your Websites",
    noWebsitesYet: "No websites have been built yet.",
    noWebsitesDesc: "Use the sidebar to create your very first website!",
    errorTitle: "An Error Occurred",
    close: "Close",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    builderTab: "Builder Workspace",
    previewTab: "Live Preview",
    creditsRemaining: "Credits remaining",
    activeStatus: "Active",
    buyCredits: "Buy / Recharge",
    faqAndDocs: "FAQ & Documentation",
    support: "Support (WhatsApp)",
    chatPlaceholder: "What kind of website would you like to build?",
    send: "Send prompt",
    refineInstruction: "Want to change or refine something?",
    refineExplain: "Type your refinement or styling instructions for your website here.",
    selectCode: "Apply this code",
    copied: "Copied!",
    copy: "Copy Code",
    downloadHtml: "Download HTML File",
    previewLive: "Live Preview",
    databaseWizard: "Database Wizard",
  }
};
