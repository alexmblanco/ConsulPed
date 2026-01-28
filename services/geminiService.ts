
import { GoogleGenAI } from "@google/genai";

// Always use named parameter for apiKey and ensure it uses process.env.API_KEY directly
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getClinicalSummary = async (notes: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Eres un asistente pediátrico experto. Resume la siguiente nota clínica en 3 puntos clave: 
      1. Diagnóstico/Hallazgos principales. 
      2. Tratamiento sugerido. 
      3. Recomendaciones para los padres.
      Nota: ${notes}`,
      config: {
        temperature: 0.7,
      },
    });
    // Access .text property directly as it is a getter, not a method
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudo generar el resumen clínico en este momento.";
  }
};

export const analyzeSymptoms = async (symptoms: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Basado en estos síntomas pediátricos, sugiere posibles diagnósticos diferenciales y banderas rojas (urgencias) que el doctor debe considerar. Síntomas: ${symptoms}`,
      config: {
        temperature: 0.3,
      },
    });
    // Access .text property directly
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error al analizar síntomas.";
  }
};
