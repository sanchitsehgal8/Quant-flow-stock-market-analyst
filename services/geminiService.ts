import { GoogleGenAI, Type } from "@google/genai";

export interface ChatContext {
  ticker: string;
  currentPrice: number;
  recommendation: string;
  confidence: number;
  riskLevel: string;
}

export const generateAnalysisResponse = async (
  messages: { role: string; text: string }[],
  context: ChatContext
): Promise<string> => {
  try {
    // Initialize client here to ensure process.env.API_KEY is populated
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const systemInstruction = `
      You are a Senior Quantitative Analyst at a top Wall Street firm.
      You are analyzing the stock ${context.ticker}.
      Current Price: $${context.currentPrice.toFixed(2)}.
      Model Recommendation: ${context.recommendation} (Confidence: ${context.confidence}%).
      Risk Level: ${context.riskLevel}.
      
      Your goal is to explain financial concepts, interpret the data, and provide reasoned arguments.
      Be professional, concise, and data-driven. Do not give financial advice as a certainty, but as analysis.
      If asked about future price, mention that markets are probabilistic.
      Use markdown for formatting.
    `;
    
    const chat = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        systemInstruction,
        temperature: 0.7,
      },
      history: messages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      })),
    });

    const lastMessage = messages[messages.length - 1].text;
    const result = await chat.sendMessage({ message: lastMessage });
    
    return result.text || "I couldn't generate an analysis at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI Analyst. Please check your API Key configuration.";
  }
};

export const generateMarketMoodImage = async (
  context: ChatContext,
  size: '1K' | '2K' | '4K' = '1K'
): Promise<string | null> => {
  try {
    // Initialize client here to ensure process.env.API_KEY is populated
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const sentiment = context.recommendation === 'BUY' ? 'Bullish, optimistic, growing, green and gold colors, upward momentum' : 
                      context.recommendation === 'SELL' ? 'Bearish, cautious, stormy, red and grey colors, downward pressure' : 
                      'Neutral, balanced, steady, blue and white colors, horizon';
    
    const prompt = `
      An abstract, cinematic, 3D render representing the financial sentiment of ${context.ticker} stock.
      Mood: ${sentiment}.
      Style: High-tech financial data visualization merged with abstract art. 
      Professional, clean, high quality.
    `;

    // Using gemini-3-pro-image-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-image-preview',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
            imageSize: size,
            aspectRatio: "16:9"
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    
    return null;
  } catch (error) {
    console.error("Gemini Image Gen Error:", error);
    throw error;
  }
};