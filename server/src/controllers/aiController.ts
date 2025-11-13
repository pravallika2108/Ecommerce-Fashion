import { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// AI Style Assistant - Chat endpoint
export const handleChat = async (req: Request, res: Response) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build conversation messages
    const messages = [
      ...conversationHistory,
      {
        role: "user" as const,
        content: `You are a fashion stylist assistant for ShopVibe, an online clothing store. 
        Help customers with style advice, outfit suggestions, and fashion questions.
        Be friendly, helpful, and knowledgeable about current fashion trends.
        Keep responses concise and practical.
        
        Customer question: ${message}`,
      },
    ];

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: messages,
    });

    res.json({
      response: response.content[0].text,
      conversationHistory: [
        ...messages,
        { role: "assistant", content: response.content[0].text },
      ],
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      error: "Failed to get AI response",
      details: error.message,
    });
  }
};

// Smart Size Advisory endpoint
export const handleSizeAdvisory = async (req: Request, res: Response) => {
  try {
    const { productName, availableSizes, measurements } = req.body;

    if (!productName || !measurements) {
      return res.status(400).json({
        error: "Product name and measurements are required",
      });
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 512,
      messages: [
        {
          role: "user",
          content: `As a fashion sizing expert, recommend the best size for ${productName}.
          
Available sizes: ${availableSizes.join(", ")}

Customer measurements:
- Height: ${measurements.height} cm
- Weight: ${measurements.weight} kg
- Chest: ${measurements.chest} cm
- Waist: ${measurements.waist} cm

Provide a concise size recommendation with reasoning. Be specific about which size to choose.`,
        },
      ],
    });

    res.json({
      recommendation: response.content[0].text,
    });
  } catch (error: any) {
    console.error("Size Advisory Error:", error);
    res.status(500).json({
      error: "Failed to get size recommendation",
      details: error.message,
    });
  }
};

// Visual Search endpoint
export const handleVisualSearch = async (req: Request, res: Response) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Remove data URL prefix if present
    const base64Data = imageBase64.includes("base64,")
      ? imageBase64.split("base64,")[1]
      : imageBase64;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: "image/jpeg",
                data: base64Data,
              },
            },
            {
              type: "text",
              text: `Analyze this clothing item and describe:
1) Type of garment (e.g., dress, shirt, pants)
2) Color and pattern details
3) Style and suitable occasions
4) Key features and design elements

Then suggest specific keywords to search for similar items in our fashion store.`,
            },
          ],
        },
      ],
    });

    res.json({
      analysis: response.content[0].text,
    });
  } catch (error: any) {
    console.error("Visual Search Error:", error);
    res.status(500).json({
      error: "Failed to analyze image",
      details: error.message,
    });
  }
};
