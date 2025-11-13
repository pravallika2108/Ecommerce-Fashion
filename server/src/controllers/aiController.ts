import { Request, Response } from "express";
import Anthropic from "@anthropic-ai/sdk";

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Helper function to extract text from content blocks
const extractTextFromContent = (content: Anthropic.ContentBlock[]): string => {
  const textBlock = content.find((block) => block.type === "text");
  return textBlock && "text" in textBlock ? textBlock.text : "";
};

// AI Style Assistant - Chat endpoint
export const handleChat = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      res.status(400).json({ error: "Message is required" });
      return;
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

    const responseText = extractTextFromContent(response.content);

    res.json({
      response: responseText,
      conversationHistory: [
        ...messages,
        { role: "assistant", content: responseText },
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
export const handleSizeAdvisory = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { productName, availableSizes, measurements } = req.body;

    if (!productName || !measurements) {
      res.status(400).json({
        error: "Product name and measurements are required",
      });
      return;
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

    const recommendationText = extractTextFromContent(response.content);

    res.json({
      recommendation: recommendationText,
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
export const handleVisualSearch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "Image is required" });
      return;
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

    const analysisText = extractTextFromContent(response.content);

    res.json({
      analysis: analysisText,
    });
  } catch (error: any) {
    console.error("Visual Search Error:", error);
    res.status(500).json({
      error: "Failed to analyze image",
      details: error.message,
    });
  }
};
