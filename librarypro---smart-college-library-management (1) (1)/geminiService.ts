
import { GoogleGenAI, Type } from "@google/genai";
import { Book } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getBookRecommendations = async (borrowedHistory: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Based on this list of books borrowed: ${borrowedHistory.join(', ')}, suggest 3 similar academic or fiction books that a college student might enjoy. Provide names and authors.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              author: { type: Type.STRING },
              reason: { type: Type.STRING }
            },
            required: ["title", "author", "reason"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini Error:", error);
    return [];
  }
};

export const generateBookDescription = async (title: string, author: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a short, engaging one-paragraph summary for the book "${title}" by ${author} suitable for a library catalog.`,
    });
    return response.text;
  } catch (error) {
    return "No description available.";
  }
};
