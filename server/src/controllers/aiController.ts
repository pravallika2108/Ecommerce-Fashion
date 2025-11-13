import { Request, Response } from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// ---------- 1️⃣ Text Chat ----------
export const aiChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message } = req.body;
    const result = await model.generateContent(message);
    const text = result.response.text();
    res.json({ success: true, reply: text });
  } catch (err) {
    console.error("AI Chat Error:", err);
    res.status(500).json({ success: false, message: "AI chat failed" });
  }
};

// ---------- 2️⃣ Visual Search ----------
export const aiVisualSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { description, imageUrl } = req.body;

    const result = await model.generateContent([
      { text: `Analyze the image and ${description}` },
      { image_url: imageUrl },
    ]);

    res.json({ success: true, reply: result.response.text() });
  } catch (err) {
    console.error("AI Visual Search Error:", err);
    res.status(500).json({ success: false, message: "Visual search failed" });
  }
};

// ---------- 3️⃣ Size / Style Advisory ----------
export const aiSizeAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { bodyType, height, weight, fitPreference } = req.body;

    const prompt = `
      Recommend clothing sizes and fits for:
      Height: ${height} cm
      Weight: ${weight} kg
      Body Type: ${bodyType}
      Fit Preference: ${fitPreference}
    `;

    const result = await model.generateContent(prompt);
    res.json({ success: true, advice: result.response.text() });
  } catch (err) {
    console.error("AI Size Advisory Error:", err);
    res.status(500).json({ success: false, message: "Size advisory failed" });
  }
};
