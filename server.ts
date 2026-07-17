import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Lazy initialization of Google Gen AI to prevent crash if key is missing/placeholder
let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
    throw new Error("Mila ampidirina ny GEMINI_API_KEY anao ao amin'ny 'Settings > Secrets' ao amin'ny AI Studio mba ahafahan'ny AI mamorona ny tranonkalanao.");
  }
  
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
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

app.post("/api/generate-site", async (req, res) => {
  try {
    const { prompt, existingCode, instructionType } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Mila mametraka torolalana (prompt) ianao." });
    }

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

    const response = await getAI().models.generateContent({
      model: "gemini-3.5-flash",
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
      // Fallback: search for <html> tag or return everything
      const htmlStart = replyText.indexOf("<html");
      const htmlEnd = replyText.lastIndexOf("</html>");
      if (htmlStart !== -1 && htmlEnd !== -1) {
        htmlCode = replyText.substring(htmlStart, htmlEnd + 7);
      } else {
        htmlCode = replyText;
      }
    }

    res.json({
      success: true,
      code: htmlCode,
      rawExplanation: replyText.replace(/```html[\s\S]*?```/g, "").trim()
    });

  } catch (error: any) {
    console.error("Fahadisoana teo amin'ny famoronana:", error);
    res.status(500).json({
      error: "Nisy olana teo amin'ny fifandraisana amin'ny AI. Manandrama indray azafady.",
      details: error.message
    });
  }
});

// Serve frontend with Vite in dev, static files in prod
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
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
