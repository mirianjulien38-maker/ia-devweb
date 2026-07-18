import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { readDb, writeDb, rotateGeminiKey, User, PaymentClaim } from "./server-db";

dotenv.config();

const app = express();
// Bind to the dynamic PORT specified by Render in production, otherwise use 3000 for AI Studio containers
const PORT = process.env.RENDER === "true" && process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.use(express.json({ limit: "15mb" }));

// Initialize Google Gen AI with specific keys (either custom or fallback default)
function getAIClient(customApiKey?: string | null): GoogleGenAI {
  const apiKey = customApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    const isRender = process.env.RENDER === "true";
    if (isRender) {
      throw new Error("Tsy misy GEMINI_API_KEY hita ao amin'ny Render. Azafady ampidiro ho 'Environment Variable' mitondra ny anarana 'GEMINI_API_KEY' ao amin'ny Render Dashboard-nao ny fanalahidy, na ampidiro ao amin'ny Admin Panel indray izany.");
    }
    throw new Error("Tsy misy GEMINI_API_KEY azo ampiasaina amin'izao fotoana izao. Mifandraisa amin'ny Admin na ampidiro ao amin'ny Admin Panel ny fanalahidy.");
  }
  
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

// System instruction for the AI web creator
const SYSTEM_INSTRUCTION = `Ianao dia DEVWEB IA, mpamorona tranonkala (website developer) matihanina sy sangany indrindra eran-tany.
Ny asanao dia ny mamorona tranonkala tsara tarehy, madio, responsive ary miasa tsara araka ny fangatahan'ny mpampiasa.

Tena manan-danja ireto fitsipika ireto:
1. Ny vokatra (output) dia tsy maintsy kaody HTML tokana (single-file HTML) ahitana ny styles sy javascript rehetra ilaina.
2. Mampiasà Tailwind CSS amin'ny alalan'ny script CDN:
   <script src="https://cdn.tailwindcss.com"></script>
3. Mampiasà Font Awesome ho an'ny sary kely (icons):
   <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
4. Mampiasà Google Fonts ho an'ny typography kanto (ohatra: Inter, Space Grotesk, Outfit, na Playfair Display).
5. Ny sary rehetra ampiasaina dia tokana sy tsara tarehy avy amin'ny Unsplash (ohatra: https://images.unsplash.com/photo-...) mifanaraka amin'ny lohahevitra. Aza mampiasa sary tsy misy na tapaka.
6. Mamorona lahatsoratra tena misy dikany sy mifanaraka amin'ny orinasa na lohahevitra (aza mampiasa "Lorem Ipsum").
7. Ampio JavaScript matanjaka ho an'ny fifandraisana (interactive features): menu responsive (hamburger menu), dark mode toggle, scroll smooth, modal popup, filter an'ny portfolio na vokatra, animations kanto, ary simulation handefasana form (contact form contact validation with modal popup success).
8. Ny kaody dia tokana sy madio, misy fanehoan-kevitra (comments) manazava ny fizarana tsirairay.

Raha misy kaody efa misy (existing code) omen'ny mpampiasa, ovay mivantana io kaody io araka ny fangatahany vaovao (manampy fizarana, manova loko, manitsy lahatsoratra, sns.) fa aza manary ny fizarana efa miasa tsara. Mitahiza ny rafitra sy ny lohahevitra ankapobeny raha tsy nangatahina hovaina izany.

Tsy maintsy mamaly amin'ny alàlan'ny kaody HTML ihany ianao ao anaty block code \`\`\`html ... \`\`\`. Aza asiana fanazavana be loatra ivelan'io block io.`;

// USER AUTHENTICATION ENDPOINTS
app.post("/api/register", (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) {
      return res.status(400).json({ error: "Fenoy daholo ny saha rehetra." });
    }

    const db = readDb();
    const cleanEmail = email.toLowerCase().trim();
    
    // Check if user already exists
    const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(400).json({ error: "Efa misy mampiasa io mailaka io." });
    }

    // New users get 15 free credits by default
    const newUser: User = {
      id: `user-${Date.now()}`,
      email: cleanEmail,
      name: name.trim(),
      password: password, // Simple string storage
      credits: 15,
      tokensUsed: 0,
      bonusClaimsCount: 0,
      createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    writeDb(db);

    res.json({
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        credits: newUser.credits,
        tokensUsed: newUser.tokensUsed,
        bonusClaimsCount: newUser.bonusClaimsCount,
        isAdmin: newUser.email === "horlandobe@gmail.com"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fisoratana anarana.", details: error.message });
  }
});

app.post("/api/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Ampidiro ny mailaka sy teny miafina." });
    }

    const db = readDb();
    const cleanEmail = email.toLowerCase().trim();
    const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Diso ny mailaka na ny teny miafina." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        tokensUsed: user.tokensUsed,
        bonusClaimsCount: user.bonusClaimsCount,
        isAdmin: user.email === "horlandobe@gmail.com"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fidirana.", details: error.message });
  }
});

app.post("/api/user-status", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Mila mailaka hampifanaraka ny mombamomba." });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "Tsy hita ny mpampiasa." });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        tokensUsed: user.tokensUsed,
        bonusClaimsCount: user.bonusClaimsCount,
        isAdmin: user.email === "horlandobe@gmail.com"
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fampifanarahana ny mombamomba.", details: error.message });
  }
});

// CLAIM 10 FREE CREDITS BONUS (Free tier bonus rule: max 30 credits in 30 days, 10 credits claim per day/interval)
app.post("/api/claim-free-bonus", (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Mila mailaka hampandehanana ny bonus." });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "Tsy hita ny mpampiasa." });
    }

    // Rule: "ho an'i olona mandeha gratuit dia mahazo bonus 10 creidt ao anty 3 andro isambolana ihany, izany hoe 30 credit ihany no azony ao anaty 30 jours raha tsy manao depot"
    // Allow up to 3 claims (30 credits total).
    if (user.bonusClaimsCount >= 3) {
      return res.status(400).json({ error: "Efa lany ny fahafahanao mangataka bonus gratuit amin'ity volana ity (Max 3 claims / 30 Credits ao anatin'ny 30 andro)." });
    }

    // Cooldown check: 24h between claims
    if (user.lastBonusClaimed) {
      const lastClaim = new Date(user.lastBonusClaimed).getTime();
      const now = Date.now();
      const diffMs = now - lastClaim;
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (diffMs < oneDayMs) {
        const hoursLeft = Math.ceil((oneDayMs - diffMs) / (60 * 60 * 1000));
        return res.status(400).json({ error: `Afaka mangataka bonus indray ianao rehefa afaka ${hoursLeft} ora.` });
      }
    }

    user.credits += 10;
    user.bonusClaimsCount += 1;
    user.lastBonusClaimed = new Date().toISOString();

    writeDb(db);

    res.json({
      success: true,
      message: "Nahazo bonus 10 credits soa aman-tsara ianao! Arahabaina.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        credits: user.credits,
        tokensUsed: user.tokensUsed,
        bonusClaimsCount: user.bonusClaimsCount,
        isAdmin: user.email === "horlandobe@gmail.com"
      }
    });

  } catch (error: any) {
    res.status(500).json({ error: "Tsy nahomby ny fangatahana bonus.", details: error.message });
  }
});

// SUBMIT NEW PAYMENT CLAIM
app.post("/api/submit-payment", (req, res) => {
  try {
    const { email, plan, transactionRef, senderPhone } = req.body;
    if (!email || !plan || !transactionRef || !senderPhone) {
      return res.status(400).json({ error: "Fenoy daholo ny saha rehetra mialohan'ny handefasana fangatahana." });
    }

    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "Tsy hita ny mpampiasa." });
    }

    let creditsToAward = 0;
    let amount = 0;
    if (plan === "10000ar") {
      creditsToAward = 150;
      amount = 10000;
    } else if (plan === "20000ar") {
      creditsToAward = 300;
      amount = 20000;
    } else if (plan === "50000ar") {
      creditsToAward = 450;
      amount = 50000;
    } else {
      return res.status(400).json({ error: "Tsy misy io plan io." });
    }

    const newClaim: PaymentClaim = {
      id: `pay-${Date.now()}`,
      userId: user.id,
      userEmail: user.email,
      userName: user.name,
      plan: plan,
      creditsToAward,
      transactionRef: transactionRef.trim(),
      senderPhone: senderPhone.trim(),
      amount,
      status: "pending",
      createdAt: new Date().toISOString()
    };

    db.payments.push(newClaim);
    writeDb(db);

    res.json({
      success: true,
      message: "Nalefa soa aman-tsara ny taratasy fanamarinana handoavam-bola. Ny Admin dia hijery izany haingana indrindra."
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fandefasana fandoavam-bola.", details: error.message });
  }
});

// ADMIN ENDPOINTS (Strictly restricted to horlandobe@gmail.com)
app.get("/api/admin/dashboard-stats", (req, res) => {
  try {
    const adminEmail = req.query.adminEmail as string;
    if (!adminEmail || adminEmail.toLowerCase().trim() !== "horlandobe@gmail.com") {
      return res.status(403).json({ error: "Tsy nahazoana alalana (Tsy Admin ianao)." });
    }

    const db = readDb();
    res.json({
      success: true,
      users: db.users.map(u => ({ id: u.id, name: u.name, email: u.email, credits: u.credits, tokensUsed: u.tokensUsed })),
      payments: db.payments,
      geminiKeys: db.geminiKeys,
      currentKeyIndex: db.currentKeyIndex
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fangatahana statistika.", details: error.message });
  }
});

app.post("/api/admin/save-keys", (req, res) => {
  try {
    const { adminEmail, keys } = req.body;
    if (!adminEmail || adminEmail.toLowerCase().trim() !== "horlandobe@gmail.com") {
      return res.status(403).json({ error: "Tsy nahazoana alalana (Tsy Admin ianao)." });
    }

    if (!Array.isArray(keys)) {
      return res.status(400).json({ error: "Mila array ny keys." });
    }

    const db = readDb();
    // Filter out empty lines or spaces
    db.geminiKeys = keys.map(k => k.trim()).filter(k => k.length > 0);
    // Reset key index if keys list shrunk
    if (db.currentKeyIndex >= db.geminiKeys.length) {
      db.currentKeyIndex = 0;
    }
    writeDb(db);

    res.json({
      success: true,
      message: `Voatahiry soa aman-tsara ireo API keys miisa ${db.geminiKeys.length}.`,
      geminiKeys: db.geminiKeys
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fitahirizana API keys.", details: error.message });
  }
});

app.post("/api/admin/payments/approve", (req, res) => {
  try {
    const { adminEmail, paymentId } = req.body;
    if (!adminEmail || adminEmail.toLowerCase().trim() !== "horlandobe@gmail.com") {
      return res.status(403).json({ error: "Tsy nahazoana alalana (Tsy Admin ianao)." });
    }

    const db = readDb();
    const payment = db.payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Tsy hita io fandoavam-bola io." });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ error: "Efa voamarina na nolavina io fandoavam-bola io." });
    }

    // Award credits to the user
    const user = db.users.find(u => u.id === payment.userId);
    if (!user) {
      return res.status(404).json({ error: "Tsy hita ny tompon'ity fandoavam-bola ity." });
    }

    user.credits += payment.creditsToAward;
    payment.status = "approved";

    writeDb(db);

    res.json({
      success: true,
      message: `Nekena ny fandoavam-bola. Nahazo fahana ${payment.creditsToAward} credits i ${user.name}.`
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fankatoavana fandoavam-bola.", details: error.message });
  }
});

app.post("/api/admin/payments/reject", (req, res) => {
  try {
    const { adminEmail, paymentId } = req.body;
    if (!adminEmail || adminEmail.toLowerCase().trim() !== "horlandobe@gmail.com") {
      return res.status(403).json({ error: "Tsy nahazoana alalana (Tsy Admin ianao)." });
    }

    const db = readDb();
    const payment = db.payments.find(p => p.id === paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Tsy hita io fandoavam-bola io." });
    }

    if (payment.status !== "pending") {
      return res.status(400).json({ error: "Efa voamarina na nolavina io fandoavam-bola io." });
    }

    payment.status = "rejected";
    writeDb(db);

    res.json({
      success: true,
      message: "Nolavina soa aman-tsara ny fandoavam-bola."
    });
  } catch (error: any) {
    res.status(500).json({ error: "Fahadisoana teo amin'ny fandavana fandoavam-bola.", details: error.message });
  }
});


// MAIN GENERATION ENDPOINT WITH KEY ROTATION & CREDIT COSTING
app.post("/api/generate-site", async (req, res) => {
  try {
    const { prompt, existingCode, instructionType, userEmail } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Mila mametraka torolalana (prompt) ianao." });
    }

    if (!userEmail) {
      return res.status(401).json({ error: "Mila miditra (connexion) ianao vao afaka mamorona tranonkala." });
    }

    // Verify user credit status
    const db = readDb();
    const user = db.users.find(u => u.email.toLowerCase() === userEmail.toLowerCase().trim());
    if (!user) {
      return res.status(404).json({ error: "Mila misoratra anarana sy miditra ianao." });
    }

    if (user.credits <= 0) {
      return res.status(402).json({
        error: "Lany ny fahana (credit) anao.",
        isCreditsExhausted: true,
        message: "Mila mividy crédit fanampiny ianao, na mangataha bonus gratuit raha mbola manana."
      });
    }

    // Key Rotation: pick rotated key if registered, otherwise fall back to environment key
    const rotatedKey = rotateGeminiKey();
    const aiClient = getAIClient(rotatedKey);

    let contents = "";
    if (existingCode) {
      contents = `Fangatahana fanovana tranonkala: ${prompt}

Indro ny kaody efa misy ankehitriny izay mila hovaina:
\`\`\`html
${existingCode}
\`\`\`

Azafady, ovay ity kaody ity araka ny fangatahana etsy ambony. Avereno ny kaody HTML feno nohavaozina ao anaty block \`\`\`html ... \`\`\`.`;
    } else {
      contents = `Mamorona tranonkala vaovao momba ity lohahevitra ity: ${prompt}`;
    }

    // Call Gemini 2.5 Flash / 3.5 Flash (or equivalent model)
    const response = await aiClient.models.generateContent({
      model: "gemini-2.5-flash", // Rotating through keys for gemini-2.5-flash
      contents: contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const replyText = response.text || "";

    // Extract HTML block
    let htmlCode = "";
    const match = replyText.match(/```html([\s\S]*?)```/) || replyText.match(/```[\s\S]*?<html>([\s\S]*?)<\/html>[\s\S]*?```/i);
    
    if (match) {
      htmlCode = match[1].trim();
    } else {
      const htmlStart = replyText.indexOf("<html");
      const htmlEnd = replyText.lastIndexOf("</html>");
      if (htmlStart !== -1 && htmlEnd !== -1) {
        htmlCode = replyText.substring(htmlStart, htmlEnd + 7);
      } else {
        htmlCode = replyText;
      }
    }

    // Calculate exact tokens used (if provided by API, otherwise fallback calculation)
    const usage = response.usageMetadata;
    const totalTokens = usage?.totalTokenCount || Math.ceil((prompt.length + replyText.length) / 3.5);

    // Deduct credit: 1 credit = 20,000 tokens
    const creditCost = totalTokens / 20000;
    
    // Fetch latest user instance again to prevent concurrent writes conflicts
    const updatedDb = readDb();
    const latestUser = updatedDb.users.find(u => u.id === user.id)!;
    
    latestUser.credits = Math.max(0, parseFloat((latestUser.credits - creditCost).toFixed(4)));
    latestUser.tokensUsed += totalTokens;
    writeDb(updatedDb);

    res.json({
      success: true,
      code: htmlCode,
      rawExplanation: replyText.replace(/```html[\s\S]*?```/g, "").trim(),
      tokensUsed: totalTokens,
      creditCost: parseFloat(creditCost.toFixed(4)),
      userCredits: latestUser.credits
    });

  } catch (error: any) {
    console.error("Fahadisoana teo amin'ny famoronana:", error);
    res.status(500).json({
      error: "Nisy olana teo amin'ny fifandraisana amin'ny AI. Manandrama indray azafady.",
      details: error.message
    });
  }
});

// SESSION SYNC FOR STATELESS HOSTING (RENDER)
app.post("/api/sync-render-session", (req, res) => {
  try {
    const { user, geminiKeys } = req.body;
    let userRecreated = false;
    let keysRestored = false;

    const db = readDb();

    if (user && user.email) {
      const cleanEmail = user.email.toLowerCase().trim();
      const existing = db.users.find(u => u.email.toLowerCase() === cleanEmail);
      if (!existing) {
        // Recreate the user session based on local storage backup
        const restoredUser: User = {
          id: user.id || `user-${Date.now()}`,
          email: cleanEmail,
          name: user.name || "User",
          password: user.password || "RestoredUserPwd",
          credits: typeof user.credits === "number" ? user.credits : 15,
          tokensUsed: typeof user.tokensUsed === "number" ? user.tokensUsed : 0,
          bonusClaimsCount: typeof user.bonusClaimsCount === "number" ? user.bonusClaimsCount : 0,
          lastBonusClaimed: user.lastBonusClaimed,
          createdAt: user.createdAt || new Date().toISOString()
        };
        db.users.push(restoredUser);
        userRecreated = true;
      }
    }

    if (Array.isArray(geminiKeys) && geminiKeys.length > 0) {
      // If the server has no Gemini keys (meaning it was reset on Render), restore them!
      if (db.geminiKeys.length === 0) {
        db.geminiKeys = geminiKeys.map((k: string) => k.trim()).filter((k: string) => k.length > 0);
        keysRestored = true;
      }
    }

    if (userRecreated || keysRestored) {
      writeDb(db);
    }

    res.json({
      success: true,
      userRecreated,
      keysRestored,
      totalUsersCount: db.users.length,
      totalKeysCount: db.geminiKeys.length
    });
  } catch (error: any) {
    console.error("Fahadisoana rehefa nampifanaraka ny Render session:", error);
    res.status(500).json({ error: "Tsy nahomby ny fampifanarahana ny mombamomba.", details: error.message });
  }
});

// Serve frontend with Vite in dev, static files in prod
async function startServer() {
  // Render environment is always considered production, regardless of NODE_ENV
  const isProduction = process.env.NODE_ENV === "production" || process.env.RENDER === "true";

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
