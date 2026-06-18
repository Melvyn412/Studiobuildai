import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import "dotenv/config";

// Resolve Gemini API key supporting fallbacks for platform limitations
function getGeminiApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.API_KEY || process.env.USER_GEMINI_API_KEY;
}
// PayPal integration settings handled dynamically without SDK dependencies to prevent container startup crashes.
async function getPayPalAccessToken(clientId: string, clientSecret: string, basePaypalUrl: string): Promise<string> {
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${basePaypalUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`PayPal Access Token request failed: ${errText}`);
  }

  const data = await response.json() as { access_token: string };
  return data.access_token;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Secure PayPal order creation gateway
  app.post("/api/paypal/create-order", async (req, res) => {
    const { planName, billingPeriod, supportTier, priceGBP } = req.body;
    
    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
    const mode = process.env.PAYPAL_MODE || "sandbox"; // 'sandbox' or 'live'

    if (!clientId || !clientSecret) {
      return res.json({ 
        isSimulated: true, 
        message: "PayPal API keys are missing in host secrets. Defaulting to high-fidelity local PayPal gateway simulation." 
      });
    }

    try {
      const basePaypalUrl = mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
      const accessToken = await getPayPalAccessToken(clientId, clientSecret, basePaypalUrl);

      const amountValue = Number(priceGBP || 0).toFixed(2);
      const appUrl = process.env.APP_URL || "http://localhost:3000";

      const orderPayload = {
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "GBP",
              value: amountValue
            },
            description: `STUDIOBUILDAI - ${planName} Plan (${billingPeriod}). Support Tier: ${supportTier}.`
          }
        ],
        application_context: {
          return_url: `${appUrl}/?payment_success=true&plan=${encodeURIComponent(planName)}&support=${encodeURIComponent(supportTier)}&amount=${priceGBP}`,
          cancel_url: `${appUrl}/?payment_cancel=true`,
          brand_name: "STUDIOBUILDAI Sovereign HR",
          user_action: "PAY_NOW"
        }
      };

      const orderResponse = await fetch(`${basePaypalUrl}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(orderPayload)
      });

      if (!orderResponse.ok) {
        const errText = await orderResponse.text();
        throw new Error(`PayPal checkout order request failed: ${errText}`);
      }

      const orderData = await orderResponse.json() as any;
      const approveLink = orderData.links.find((link: any) => link.rel === "approve" || link.rel === "payer-action");

      if (!approveLink) {
        throw new Error("PayPal response failed to yield a valid redirection URL link.");
      }

      return res.json({ isSimulated: false, url: approveLink.href });
    } catch (err: any) {
      console.error("PayPal Order Initiation Failure:", err);
      return res.status(500).json({ error: err.message || "Failed to initiate PayPal Checkout order." });
    }
  });

  // Secure API Proxy for internal Gemini chat
  app.post("/api/chat", async (req, res) => {
    const { messages, context } = req.body;

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json({ 
        error: "API_KEY_MISSING",
        text: `⚠️ **API Key Missing**: The Gemini API key is not configured in the host environment.
        
To activate the fully functional secure AI Assistant, please configure your key:
1. Open the **Settings > Secrets** (or **Environment Variables**) panel in the Google AI Studio UI.
2. Define a secret named \`API_KEY\` or \`USER_GEMINI_API_KEY\` (since \`GEMINI_API_KEY\` is system-reserved) and paste your Gemini API credentials.
3. Save changes and restart your session.

*While unconfigured, this private suite runs in local production fallback mode.*` 
      });
    }

    try {
      // Lazy-initialize the Google GenAI client to prevent startup failure if keys are unset
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Structure any user-selected HR entity context passed to chat
      let contextInstruction = "";
      if (context) {
        contextInstruction = `The user has highlighted the following local HR context for reference in this discussion:
---
${context}
---
Please use this metadata to tailor your HR analysis and advice.`;
      }

      const systemInstruction = `You are the Private HR Assistant, a secure, local-first HR workspace AI. 
This production-ready container is isolated and does not sync user info to cloud metrics or external tracking networks. 
Provide expert, structured, and compliant guidance on candidate screening, onboarding checklists, performance appraisal draft reviews, interview guides, and team development.

Always format your calculations, bullet points, checklists, and templates cleanly using standard Markdown headings, lists, and bold parameters to maximize visual readability.
Keep your output structured, clear, and focused.

${contextInstruction}`;

      // Map communication roles to model contents format
      const contents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const responseText = response.text || "I was unable to formulate a response. Please refine your query and try again.";
      return res.json({ text: responseText });

    } catch (err: any) {
      console.error("Gemini API Secure Client Error:", err);
      return res.status(200).json({ 
        error: "API_ERROR", 
        text: `❌ **Connection Framework Error**: There was an issue processing your query through the secure server gateway. Details: ${err.message || 'Unknown network error'}` 
      });
    }
  });

  // Secure API Proxy for document-intelligence analysis
  app.post("/api/document-intelligence", async (req, res) => {
    const { text, docType } = req.body;

    if (!text || typeof text !== "string" || text.trim() === "") {
      return res.status(400).json({ error: "MISSING_TEXT", text: "Please provide valid document text to analyze." });
    }

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.status(200).json({ 
        error: "API_KEY_MISSING",
        text: "The Gemini API key is not configured in the host environment."
      });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const systemInstruction = `You are the Document Intelligence Engine, a high-trust compliance officer and legal-HR corporate contracts analyst.
Your mandate is to perform deep compliance analysis, clause summaries, risk audits, and policy extracts from the provided document text of type: ${docType || 'Contract'}.

You MUST perform four core tasks and synthesize them into the specified JSON structure:
1. Contract Analysis & Metadata: Identify document Title, bound parties, governing jurisdictions (e.g. governingLaw like 'Delaware' or similar), effective starting dates, and terminating notice windows.
2. Policy Summarisation: Create a concise, high-level overview outline, bullet points of key takeaways, and organizational impact assessments.
3. Risk Flagging: Audit the text for any security hazards, termination liabilities, non-compete locks, strict liabilities, or compliance gaps. Risk level MUST be evaluated as exactly: "High" or "Medium" or "Low". Offer rigorous, actionable remediation strategies.
4. Clause Extraction: Isolate critical clauses (e.g. Compensation, Non-disclosure, Intellectual Property, Grievances, Hybrid reporting commitments, or Severance ratios) with exact quotes verbatim or near-verbatim from the text, non-lawyer plain translation summaries, and a severity/risk rating of concern on a scale from 0 to 10 (0 safe, 10 high-risk).

Strict requirement: Return ONLY a valid JSON output matching the requested schema. No additional conversational markdown or wrapping.`;

      const prompt = `Perform document intelligence on the following text:\n\nDocument Contents:\n${text}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: {
                type: Type.OBJECT,
                properties: {
                  overview: { type: Type.STRING },
                  keyPoints: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  audienceAssessment: { type: Type.STRING }
                },
                required: ["overview", "keyPoints", "audienceAssessment"]
              },
              risks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    clause: { type: Type.STRING },
                    riskLevel: { type: Type.STRING }, // 'High' | 'Medium' | 'Low'
                    description: { type: Type.STRING },
                    recommendation: { type: Type.STRING }
                  },
                  required: ["clause", "riskLevel", "description", "recommendation"]
                }
              },
              clauses: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    exactText: { type: Type.STRING },
                    explanation: { type: Type.STRING },
                    riskScore: { type: Type.INTEGER }
                  },
                  required: ["name", "exactText", "explanation", "riskScore"]
                }
              },
              metadata: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  parties: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING } 
                  },
                  governingLaw: { type: Type.STRING },
                  effectiveDate: { type: Type.STRING },
                  terminationNotice: { type: Type.STRING }
                },
                required: ["title", "parties", "governingLaw", "effectiveDate", "terminationNotice"]
              }
            },
            required: ["summary", "risks", "clauses", "metadata"]
          },
          temperature: 0.1,
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Received empty text payload from generative AI model.");
      }

      const parsedJSON = JSON.parse(responseText.trim());
      return res.json(parsedJSON);

    } catch (err: any) {
      console.error("Document Intelligence Parsing Failure:", err);
      return res.status(200).json({
        error: "PARSING_ERROR",
        text: `There was a failure compiling structure schema output from Gemini: ${err.message || 'Unknown processing error'}`
      });
    }
  });

  // Vite development server / production server routing
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
    console.log(`[Private HR Backend] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
