import express, { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy Google GenAI Client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set in environment variables. Falling back to local offline logic.");
    }
    aiClient = new GoogleGenAI({ apiKey: apiKey || "dummy-key-for-initialization" });
  }
  return aiClient;
}

// Health check endpoint
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Dedicated AI Endpoint for individual Simulation Summary & Q&A
app.post("/api/simulation-ai", async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      simulationTitle, 
      simulationKey, 
      category, 
      question, 
      mode = "ask", 
      contextData 
    } = req.body;

    if (!question && mode === "ask") {
      res.status(400).json({ error: "প্রশ্ন বা প্রম্পট প্রদান করুন।" });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      // Return structured intelligent fallback if API key is not yet set
      res.json({
        success: true,
        answer: `[অফলাইন মোড - এআই সহকারী]: "${simulationTitle || simulationKey}" সিমুলেশন প্রজেক্টের জন্য আপনার অনুসন্ধানের উত্তর প্রস্তুত। এই প্রজেক্টের মূল গাণিতিক ভিত্তি ও পদার্থবিজ্ঞানের নীতিসমূহ অত্যন্ত নিখুঁতভাবে নির্ধারিত হয়েছে।\n\n- **প্রজেক্টের গুরুত্ব**: এটি বাস্তব প্রকৌশল ও গবেষণায় ব্যাপকভাবে ব্যবহৃত হয়।\n- **পরামর্শ**: আরও বিস্তারিত ডেরিভেশন ও কাস্টম সমাধানের জন্য আপনার প্রশ্নটি নির্দিষ্ট সমীকরণ বা প্যারামিটার উল্লেখ করে জিজ্ঞাসা করতে পারেন।`,
        isOfflineFallback: true
      });
      return;
    }

    const ai = getGenAI();

    let systemInstruction = `You are an elite, highly knowledgeable Academic & Engineering AI Assistant specializing in STEM simulations, Robotics, Applied Mathematics, Physics, and Software Engineering.
The user is viewing a specific interactive simulation project in the "Digital Earning & bKash Hub" platform by researcher Gopeswar Roy.

Current Project Context:
- Project Title: ${simulationTitle || 'STEM Simulation Project'}
- Project Key: ${simulationKey || 'general'}
- Category: ${category || 'mechanics/mathematics'}
- Additional Context / Equations: ${JSON.stringify(contextData || {})}

Guidelines for your response:
1. Always respond in clear, professional, elegant, and insightful Bengali (বাংলা), keeping technical mathematical terms, equations, and variable names in clear standard English notation (e.g., L1, θ, ∂u/∂t, Eigenvalue λ, det(J), etc.).
2. Focus EXCLUSIVELY on this specific simulation project.
3. If the user asks a question, provide a step-by-step, mathematically rigorous, and practical explanation.
4. If equations are needed, write them clearly on separate lines with step-by-step derivations.
5. If the user asks for code, provide clean, commented Python/NumPy, MATLAB, or JavaScript code.
6. Provide practical advice on how a student or freelancer can use this simulation for academic thesis, research papers, or client monetization.`;

    let prompt = "";
    if (mode === "summary") {
      prompt = `এই "${simulationTitle}" প্রজেক্টটির একটি উচ্চমানের বৈজ্ঞানিক সারসংক্ষেপ (Executive Abstract & Mathematical Blueprint) তৈরি করুন। এতে অন্তর্ভুক্ত করুন:
1. প্রজেক্টের মূল লক্ষ্য ও বৈজ্ঞানিক ভিত্তি
2. প্রধান সমীকরণসমূহ ও তাদের ব্যাখ্যা
3. বাস্তব জীবনে এর ইঞ্জিনিয়ারিং ও ইন্ডাস্ট্রিয়াল প্রয়োগ
4. এই প্রজেক্টটির মাধ্যমে ফ্রিল্যান্সিং বা থিসিসে আয়ের সুযোগ`;
    } else if (mode === "qna") {
      prompt = `এই "${simulationTitle}" প্রজেক্টটির ওপর ৫টি গভীর ও গুরুত্বপূর্ণ টেকনিক্যাল প্রশ্নোত্তর তৈরি করুন যা ভাইভা, পরীক্ষা বা ক্লায়েন্ট প্রজেক্ট প্রেজেন্টেশনে কাজে লাগবে।`;
    } else {
      prompt = `ব্যবহারকারীর নির্দিষ্ট প্রশ্ন: "${question}"\n\nএই "${simulationTitle}" সিমুলেশন প্রজেক্টের প্রেক্ষিতে বিস্তারিত ও নিখুঁত উত্তর দিন।`;
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        { role: "user", parts: [{ text: `${systemInstruction}\n\n${prompt}` }] }
      ]
    });

    const answerText = response.text || "কোনো উত্তর পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।";

    res.json({
      success: true,
      answer: answerText,
      model: "gemini-3.7-flash"
    });
  } catch (error: any) {
    console.error("Simulation AI endpoint error:", error);
    res.status(500).json({ 
      error: "AI উত্তর প্রক্রিয়াকরণে সমস্যা হয়েছে।", 
      details: error.message || String(error) 
    });
  }
});

// Setup Vite middleware for development or serve static files in production
async function setupViteOrStatic() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

setupViteOrStatic().catch((err) => {
  console.error("Failed to start server:", err);
});
