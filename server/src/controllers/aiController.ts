import { Request, Response } from "express";
import OpenAI from "openai";
import { v2 as cloudinary } from "cloudinary";




// --- Cloudinary Config ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- OpenAI Setup ---
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// ===========================================================
// 🧵 1️⃣ AI Style Assistant Chat
// ===========================================================
export const handleChat = async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // lightweight & efficient for text
      messages: [
        ...conversationHistory,
        {
          role: "system",
          content: `You are an AI Fashion Stylist Assistant for ShopVibe.
          Give short, trendy, and confident responses about outfit styling, color matching, and fashion tips.`,
        },
        { role: "user", content: message },
      ],
    });

    const reply = response.choices[0].message?.content ?? "No response generated.";
    res.json({ response: reply });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to get AI response", details: error.message });
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

    // Upload to Cloudinary first
    const uploadResponse = await cloudinary.uploader.upload(
      `data:image/jpeg;base64,${imageBase64}`,
      { folder: "visual-search" }
    );

    const imageUrl = uploadResponse.secure_url;

    // Use OpenAI Vision Model
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // Supports vision + text
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this clothing item and describe:
              1. Type and color of outfit
              2. Style (e.g., casual, formal, streetwear)
              3. Suggested matching items or accessories.`,
            },
            {
              type: "image_url",
              image_url: { url: imageUrl }, // ✅ fixed structure (was causing your TS2769 error)
            },
          ],
        },
      ],
    });

    const analysis = response.choices[0].message?.content ?? "Unable to analyze image.";
    res.json({ analysis });
  } catch (error: any) {
    console.error("Visual Search Error:", error);
    res.status(500).json({ error: "Failed to analyze image", details: error.message });
  }
};

// ===========================================================
// 📏 3️⃣ Size Advisory (Personalized Size Recommendation)
// ===========================================================
export const handleSizeAdvisory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { productName, availableSizes, measurements } = req.body;

    if (!productName || !availableSizes || !measurements) {
      res.status(400).json({ error: "Missing fields for size advisory." });
      return;
    }

    const prompt = `
    As a professional fashion size advisor, recommend the best size for ${productName}.
    Available sizes: ${availableSizes.join(", ")}.
    Customer measurements:
    - Height: ${measurements.height} cm
    - Weight: ${measurements.weight} kg
    - Chest: ${measurements.chest} cm
    - Waist: ${measurements.waist} cm

    Respond with:
    1. Recommended size
    2. Brief reasoning
    3. Fit and comfort notes
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const recommendation = response.choices[0].message?.content ?? "No recommendation available.";
    res.json({ recommendation });
  } catch (error: any) {
    console.error("Size Advisory Error:", error);
    res.status(500).json({ error: "Failed to generate recommendation", details: error.message });
  }
};
