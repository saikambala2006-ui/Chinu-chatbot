
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { CHINU_SYSTEM_INSTRUCTION } from '../constants';

/**
 * Sends a message to the Gemini model and returns the response.
 * @param message The user's message.
 * @returns The AI's response text.
 */
export const getGeminiResponse = async (message: string): Promise<string> => {
  try {
    // CRITICAL: Create a new GoogleGenAI instance right before making an API call to ensure
    // it always uses the most up-to-date API key from the dialog.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: message,
      config: {
        systemInstruction: CHINU_SYSTEM_INSTRUCTION,
      },
    });

    const text = response.text;
    if (text) {
      return text.trim();
    } else {
      return "I couldn't generate a response. Please try again.";
    }
  } catch (error: any) {
    if (error.message && error.message.includes("Requested entity was not found.")) {
      // API key issue, prompt user to re-select.
      // Assuming window.aistudio.openSelectKey() is available in the environment.
      if (window.aistudio && window.aistudio.openSelectKey) {
        window.aistudio.openSelectKey();
        return "There was an issue with the API key. Please select a valid key from a paid GCP project. More details: ai.google.dev/gemini-api/docs/billing";
      }
    }
    console.error("Error communicating with Gemini API:", error);
    return "I apologize, but I encountered an error. Please try again later or rephrase your question.";
  }
};
