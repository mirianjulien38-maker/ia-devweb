import fs from "fs";
import path from "path";

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

// Reads the DB from disk
export function readDb(): DbSchema {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, JSON.stringify(INITIAL_DB, null, 2), "utf-8");
      return INITIAL_DB;
    }
    const data = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Fahadisoana rehefa namaky DB:", error);
    return INITIAL_DB;
  }
}

// Writes the DB to disk
export function writeDb(db: DbSchema): void {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
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
  
  // Update rotation index on disk
  db.currentKeyIndex = (index + 1) % db.geminiKeys.length;
  writeDb(db);
  
  return key;
}
