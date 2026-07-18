import fs from "fs";
import path from "path";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, initializeFirestore } from "firebase/firestore";

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
        firestoreDbInstance = getFirestore(firebaseApp, config.firestoreDatabaseId);
      } else {
        firestoreDbInstance = getFirestore(firebaseApp);
      }
      isFirestoreInitialized = true;
      console.log("Firebase/Firestore initialized successfully. Database ID:", config.firestoreDatabaseId || "(default)");
    } else {
      console.warn("firebase-applet-config.json not found. Running with local disk-based persistence only.");
    }
  } catch (err) {
    console.error("Failed to initialize Firebase client SDK:", err);
  }
}

// Initialize on module load
initFirebase();

// Load initial database either from Firestore, local disk, or use default
async function loadDatabaseAsync() {
  // 1. Try Firestore if active
  if (isFirestoreInitialized && firestoreDbInstance) {
    try {
      console.log("Attempting to load database from Cloud Firestore...");
      const docRef = doc(firestoreDbInstance, "app_state", "v1");
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const cloudData = docSnap.data() as DbSchema;
        // Basic schema validations
        if (Array.isArray(cloudData.users) && Array.isArray(cloudData.geminiKeys)) {
          cachedDb = cloudData;
          console.log(`Successfully restored database from Firestore! (${cachedDb.users.length} users, ${cachedDb.geminiKeys.length} Gemini keys, ${cachedDb.payments?.length || 0} payments)`);
          
          // Also save a local backup copy
          fs.writeFileSync(DB_PATH, JSON.stringify(cachedDb, null, 2), "utf-8");
          return;
        }
      } else {
        console.log("Firestore database is empty. Seeding INITIAL_DB to Firestore...");
        await setDoc(docRef, INITIAL_DB);
        cachedDb = INITIAL_DB;
        fs.writeFileSync(DB_PATH, JSON.stringify(cachedDb, null, 2), "utf-8");
        return;
      }
    } catch (err) {
      console.error("Failed to fetch database from Firestore, falling back to local file:", err);
    }
  }

  // 2. Try Local File fallback
  try {
    if (fs.existsSync(DB_PATH)) {
      const localData = fs.readFileSync(DB_PATH, "utf-8");
      cachedDb = JSON.parse(localData);
      console.log(`Restored database from local disk. (${cachedDb.users.length} users)`);
    } else {
      cachedDb = INITIAL_DB;
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
      console.log("Initialized new local database with defaults.");
    }
  } catch (err) {
    console.error("Critical: Failed to read local database copy:", err);
    cachedDb = INITIAL_DB;
  }
}

// Synchronously kick off the asynchronous load on startup
loadDatabaseAsync();

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
      setDoc(docRef, db)
        .then(() => {
          // Success
        })
        .catch((err) => {
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

