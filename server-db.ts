import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, initializeFirestore, onSnapshot } from "firebase/firestore";

const DB_PATH = path.join(process.cwd(), "data-store.json");

export interface User {
  id: string;
  email: string;
  name: string;
  password?: string; // stored as simple text for this application
  credits: number;
  tokensUsed: number;
  lastBonusClaimed?: string; // ISO date string
  bonusClaimsCount: number; // number of times claimed
  createdAt: string;
}

export interface PaymentClaim {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  plan: "10000ar" | "20000ar" | "50000ar";
  creditsToAward: number;
  transactionRef: string;
  senderPhone: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface DbSchema {
  users: User[];
  geminiKeys: string[];
  payments: PaymentClaim[];
  currentKeyIndex: number;
}

// Initial default database structure
const INITIAL_DB: DbSchema = {
  users: [
    {
      id: "admin-default",
      email: "horlandobe@gmail.com",
      name: "Admin Horlando",
      password: "Rakoto12//", // Admin can login or set password
      credits: 99999,
      tokensUsed: 0,
      bonusClaimsCount: 0,
      createdAt: new Date().toISOString(),
    }
  ],
  geminiKeys: [],
  payments: [],
  currentKeyIndex: 0,
};

// In-memory cache for synchronous reads and extremely fast performance
let cachedDb: DbSchema = INITIAL_DB;
let isFirestoreInitialized = false;
let firestoreDbInstance: any = null;

// 1. Immediately load local backup copy synchronously so cachedDb is never empty on immediate reads
try {
  if (fs.existsSync(DB_PATH)) {
    const localData = fs.readFileSync(DB_PATH, "utf-8");
    cachedDb = JSON.parse(localData);
    console.log(`[Startup] Restored initial database cache from local disk: (${cachedDb.users.length} users, ${cachedDb.geminiKeys.length} Gemini keys, ${cachedDb.payments?.length || 0} payments)`);
  } else {
    cachedDb = INITIAL_DB;
    fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
    console.log("[Startup] Initialized new local database with defaults.");
  }
} catch (err) {
  console.error("[Startup] Failed to read local database copy:", err);
  cachedDb = INITIAL_DB;
}

// Initialize Firebase client SDK
function initFirebase() {
  try {
    const configPath = path.join(process.cwd(), "firebase-applet-config.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
      
      const firebaseApp = initializeApp({
        apiKey: config.apiKey,
        authDomain: config.authDomain,
        projectId: config.projectId,
        storageBucket: config.storageBucket,
        messagingSenderId: config.messagingSenderId,
        appId: config.appId
      });

      if (config.firestoreDatabaseId) {
        firestoreDbInstance = initializeFirestore(firebaseApp, {}, config.firestoreDatabaseId);
      } else {
        firestoreDbInstance = getFirestore(firebaseApp);
      }
      isFirestoreInitialized = true;
      console.log("Firebase/Firestore client initialized successfully. Database ID:", config.firestoreDatabaseId || "(default)");

      // Set up real-time subscription to always keep local memory in sync across instances
      const docRef = doc(firestoreDbInstance, "app_state", "v1");
      onSnapshot(docRef, async (docSnap) => {
        if (docSnap.exists()) {
          const cloudData = docSnap.data() as DbSchema;
          // Validations to ensure it's a correct schema
          if (Array.isArray(cloudData.users) && Array.isArray(cloudData.geminiKeys)) {
            cachedDb = cloudData;
            console.log(`[Firestore Sync] Real-time update loaded! (${cachedDb.users.length} users, ${cachedDb.geminiKeys.length} Gemini keys, ${cachedDb.payments?.length || 0} payments)`);
            fs.writeFileSync(DB_PATH, JSON.stringify(cachedDb, null, 2), "utf-8");
          }
        } else {
          console.log("[Firestore Sync] Cloud state is empty. Seeding local database to Firestore...");
          try {
            const sanitizedDb = JSON.parse(JSON.stringify(cachedDb));
            await setDoc(docRef, sanitizedDb);
          } catch (err) {
            console.error("[Firestore Sync] Failed to seed initial database to Firestore:", err);
          }
        }
      }, (error) => {
        console.error("Firestore real-time subscription error:", error);
      });

    } else {
      console.warn("firebase-applet-config.json not found. Running with local disk-based persistence only.");
    }
  } catch (err) {
    console.error("Failed to initialize Firebase client SDK:", err);
  }
}

// Initialize on module load
initFirebase();

// Public function: Reads the DB (instantaneous from memory)
export function readDb(): DbSchema {
  return cachedDb;
}

// Public function: Writes the DB (updates memory, local disk synchronously, and Firestore asynchronously)
export function writeDb(db: DbSchema): void {
  try {
    cachedDb = db;
    // 1. Write to local file for fast local recovery & synchronous safety
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
    
    // 2. Asynchronously write to cloud Firestore to survive server container wipes
    if (isFirestoreInitialized && firestoreDbInstance) {
      const docRef = doc(firestoreDbInstance, "app_state", "v1");
      const sanitizedDb = JSON.parse(JSON.stringify(db));
      setDoc(docRef, sanitizedDb)
        .then(() => {
          // Success
        })
        .catch((err: any) => {
          console.error("Asynchronous Cloud Firestore write failed:", err);
        });
    }
  } catch (error) {
    console.error("Fahadisoana rehefa nanoratra DB:", error);
  }
}

// Rotate through loaded API Keys and return one
export function rotateGeminiKey(): string | null {
  const db = readDb();
  if (db.geminiKeys.length === 0) {
    return null;
  }
  
  const index = db.currentKeyIndex;
  const key = db.geminiKeys[index % db.geminiKeys.length];
  
  // Update rotation index
  db.currentKeyIndex = (index + 1) % db.geminiKeys.length;
  writeDb(db);
  
  return key;
}


