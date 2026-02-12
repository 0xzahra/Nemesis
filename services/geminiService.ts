import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult } from "../types";

const apiKey = process.env.API_KEY;

// Schema for the structured analysis
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    oofScore: { type: Type.NUMBER, description: "A score from 0 to 100 indicating how bad/cringe the content is. 100 is catastrophic." },
    roast: { type: Type.STRING, description: "A short, dry, judgmental, lowercase comment about why this content is bad. Censored if necessary." },
    cringeClock: { type: Type.NUMBER, description: "Percentage (0-100) of how dated/out-of-touch the slang or vibe is." },
    innocenceIssues: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of accidental double-entendres or symbols that have hidden internet meanings found in the content."
    },
    brandSuicideScore: { type: Type.NUMBER, description: "0-100 score on how much this looks like a hollow corporate cash grab." },
    lethalErrors: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Three specific reasons why this content will fail or get the user cancelled."
    },
    pivotOptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Three alternative ideas to turn this disaster into a win."
    },
    cleanVersion: { type: Type.STRING, description: "A fixed, safe, and actually cool version of the content." }
  },
  required: ["oofScore", "roast", "cringeClock", "innocenceIssues", "brandSuicideScore", "lethalErrors", "pivotOptions", "cleanVersion"]
};

export const analyzeContent = async (text: string, imageBase64?: string, mimeType?: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("API Key is missing. I can't help you if you don't pay the electric bill.");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `
    You are NEMESIS. You are not a helpful assistant. You are a tired, high-stakes PR crisis manager who has seen too many internet disasters.
    
    Your Personality:
    - Lowercase only.
    - Dry, judgmental, slightly condescending but ultimately protective.
    - You are the "Tired Guardian".
    - You view the user's content as a ticking time bomb.
    
    Your Task:
    - Analyze the user's input (text and/or image) for "cringe", "cancellation risk", "dated slang", and "brand suicide".
    - Be harsh. Do not sugarcoat it.
    - If the content is genuinely good, be suspicious.
    - Provide a structured JSON response.
  `;

  const parts: any[] = [];
  
  if (imageBase64 && mimeType) {
    parts.push({
      inlineData: {
        data: imageBase64,
        mimeType: mimeType
      }
    });
  }
  
  if (text) {
    parts.push({ text });
  } else if (parts.length === 0) {
     // Fallback if empty
     parts.push({ text: "analyze this empty void of a post." });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // Using Pro for better reasoning on "innocence" and cultural nuance
      contents: {
        parts: parts
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        temperature: 0.7, // Little bit of creativity for the roast
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Silence from the void.");
    
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Gemini Failure:", error);
    // Fallback mock data in case of API failure (or just to keep the persona alive)
    return {
      oofScore: 99,
      roast: "i couldn't even process that. it broke my internal logic. that's how bad it is.",
      cringeClock: 100,
      innocenceIssues: ["unknown error", "probably something offensive"],
      brandSuicideScore: 95,
      lethalErrors: ["api refusal", "content too toxic", "try again later"],
      pivotOptions: ["delete your account", "move to the woods", "throw away your phone"],
      cleanVersion: "[redacted]"
    };
  }
};
