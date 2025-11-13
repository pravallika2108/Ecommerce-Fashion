import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ===========================================================
// 🔧 Initialize Gemini Client
// ===========================================================
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use lightweight and fast model
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ===========================================================
// 💬 1️⃣ AI Chat Assistant
// ===========================================================
export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const result = await textModel.generateContent(
      `You are an AI Fashion Assistant for the ShopVibe app. 
      Respond with short, helpful, trendy fashion advice.\n\nUser: ${message}`
    );

    const text = result.response.text();
    res.json({ success: true, reply: text });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ success: false, message: "AI chat failed" });
  }
};

// ===========================================================
// 🖼️ 2️⃣ Visual Search (Image Analysis)
// ===========================================================
export const handleVisualSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "Image is required" });
      return;
    }

    const result = await visionModel.generateContent([
      {
        role: "user",
        parts: [
          {
            text: `Analyze this clothing item image and describe:
            - Type of clothing
            - Color and material
            - Style (casual, formal, etc.)
            - Suggested matching items`,
          },
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
        ],
      },
    ]);

    const text = result.response.text();
    res.json({ success: true, analysis: text });
  } catch (error) {
    console.error("AI Visual Search Error:", error);
    res.status(500).json({ success: false, message: "Visual search failed" });
  }
};

// ===========================================================
// 📏 3️⃣ Size & Style Advisory
// ===========================================================
export const handleSizeAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, availableSizes, measurements } = req.body;

    if (!productName || !availableSizes || !measurements) {
      res.status(400).json({ error: "Missing fields for size advisory." });
      return;
    }

    const prompt = `
      You are a professional fashion size advisor.
      Product: ${productName}
      Available sizes: ${availableSizes.join(", ")}
      Customer measurements:
      - Height: ${measurements.height} cm
      - Weight: ${measurements.weight} kg
      - Chest: ${measurements.chest} cm
      - Waist: ${measurements.waist} cm
      Suggest:
      1️⃣ Recommended size
      2️⃣ Reason for your suggestion
      3️⃣ Fit or comfort notes
    `;

    const result = await textModel.generateContent(prompt);
    const advice = result.response.text();

    res.json({ success: true, recommendation: advice });
  } catch (error) {
    console.error("AI Size Advisory Error:", error);
    res.status(500).json({ success: false, message: "Size advisory failed" });
  }
};
