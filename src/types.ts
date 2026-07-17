export interface WebSiteProject {
  id: string;
  name: string;
  prompt: string;
  code: string;
  createdAt: string;
  explanation?: string;
  chatHistory?: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  sender: "user" | "ai";
  text: string;
  timestamp: string;
  code?: string; // Optional if this chat message contains code
}

export interface PredefinedTemplate {
  id: string;
  name: string;
  icon: string;
  prompt: string;
  description: string;
}

export interface SavedDatabaseConfig {
  id: string;
  projectName: string;
  type: "Firebase" | "Supabase";
  config: {
    // Firebase
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
    // Supabase
    url?: string;
    anonKey?: string;
  };
  createdAt: string;
}

