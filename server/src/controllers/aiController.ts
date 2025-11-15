// controllers/aiController.js

import axios from "axios";

// Load your Perplexity API key from .env
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

/**
 * ############################
 *      AI STYLE ASSISTANT
 * ############################
 */
export const handleChat = async (req, res) => {
  try {
    const { conversationHistory = [], message } = req.body;

    const messages = [
      { role: "system", content: "You are a smart style assistant who gives fashion advice." },
      ...conversationHistory,
      { role: "user", content: message },
    ];

    const result = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "sonar-medium-chat", // or "sonar-small-chat" / other supported models
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      response: result.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({
      success: false,
      message: "AI chat failed",
    });
  }
};

/**
 * ############################
 *     VISUAL SEARCH
 * ############################
 */
export const handleVisualSearch = async (req, res) => {
  try {
    const { imageBase64, mediaType } = req.body;

    const messages = [
      { role: "system", content: "You are a fashion image analyst. If the image contains clothing, describe style, type, and color in detail." },
      {
        role: "user",
        content: "Analyze this clothing image and describe type, color, and style.",
        images: [{ mime_type: mediaType || "image/jpeg", data: imageBase64 }],
      },
    ];

    const result = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "sonar-medium-chat", // Use a multi-modal model
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      analysis: result.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI Visual Search Error:", error);
    res.status(500).json({
      success: false,
      message: "Visual search failed",
    });
  }
};

/**
 * ############################
 *     SIZE ADVISORY
 * ############################
 */
export const handleSizeAdvisory = async (req, res) => {
  try {
    const { productName, availableSizes, measurements } = req.body;

    const prompt = `
      You are a fashion size advisor.
      Product: ${productName}
      Available sizes: ${availableSizes.join(", ")}
      Customer:
      - Height: ${measurements.height} cm
      - Weight: ${measurements.weight} kg
      - Chest: ${measurements.chest} cm
      - Waist: ${measurements.waist} cm
      Suggest the best size and explain your reasoning in a short friendly response.
    `;

    const messages = [
      { role: "system", content: "You are an expert fashion size advisor." },
      { role: "user", content: prompt },
    ];

    const result = await axios.post(
      PERPLEXITY_API_URL,
      {
        model: "sonar-medium-chat", // Or other supported models
        messages,
      },
      {
        headers: {
          Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({
      success: true,
      recommendation: result.data.choices[0].message.content,
    });
  } catch (error) {
    console.error("AI Size Advisory Error:", error);
    res.status(500).json({
      success: false,
      message: "Size advisory failed",
    });
  }
};

