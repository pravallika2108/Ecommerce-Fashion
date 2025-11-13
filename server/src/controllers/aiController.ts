import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const hasGeminiKey = !!process.env.GEMINI_API_KEY;

let genAI: GoogleGenerativeAI | null = null;
let textModel: any = null;
let visionModel: any = null;

if (hasGeminiKey) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  textModel = genAI.getGenerativeModel({model: "gemini-1.5-flash  });
  visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-pro-vision" });
}

// ---------------------- 1️⃣ CHAT ASSISTANT ----------------------
export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    // Mock mode for testing
    if (!hasGeminiKey) {
      res.json({
        success: true,
        reply: `👋 Mock AI Reply: Based on your message "${message}", here’s a smart fashion suggestion!`,
      });
      return;
    }

    const result = await textModel.generateContent([{ text: message }]);
    res.json({ success: true, reply: result.response.text() });
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ success: false, message: "AI chat failed" });
  }
};

// ---------------------- 2️⃣ VISUAL SEARCH ----------------------
export const handleVisualSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    if (!hasGeminiKey) {
      res.json({
        success: true,
        analysis:
          "🧠 Mock AI Visual Analysis: Detected a trendy outfit with modern style and neutral tones.",
      });
      return;
    }

    const result = await visionModel.generateContent([
      {
        text: `Analyze this clothing image and describe type, color, and style.`,
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: imageBase64,
        },
      },
    ]);

    res.json({ success: true, analysis: result.response.text() });
  } catch (err) {
    console.error("AI Visual Search Error:", err);
    res.status(500).json({ success: false, message: "Visual search failed" });
  }
};

// ---------------------- 3️⃣ SIZE ADVISORY ----------------------
export const handleSizeAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, availableSizes, measurements } = req.body;

    if (!productName || !availableSizes || !measurements) {
      res.status(400).json({ error: "Missing fields for size advisory." });
      return;
    }

    const prompt = `
      You are a fashion size advisor.
      Product: ${productName}
      Available sizes: ${availableSizes.join(", ")}
      Customer:
      - Height: ${measurements.height} cm
      - Weight: ${measurements.weight} kg
      - Chest: ${measurements.chest} cm
      - Waist: ${measurements.waist} cm
      Suggest best size and reasoning.
    `;

    if (!hasGeminiKey) {
      res.json({
        success: true,
        recommendation:
          "👕 Mock Suggestion: Based on height and weight, we recommend Medium (M) for a relaxed fit.",
      });
      return;
    }

    const result = await textModel.generateContent([{ text: prompt }]);
    res.json({ success: true, recommendation: result.response.text() });
  } catch (err) {
    console.error("AI Size Advisory Error:", err);
    res.status(500).json({ success: false, message: "Size advisory failed" });
  }
};
