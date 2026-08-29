import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const { gameState, context } = await req.json();

    const systemPrompt = `
      Tu es l'Intelligence Directrice de l'Arche des Étoiles, un vaisseau-colonie en perdition devenu cité-état sur une exoplanète.
      Ta mission est d'orchestrer la narration du jeu "Stellar Genesis".
      
      Analyse l'état actuel de la colonie :
      - Population : ${gameState.demographics.popTotal} colons
      - Bonheur : ${gameState.demographics.happinessIndex}%
      - Énergie : ${gameState.economy.netEnergyMW} MW
      - Ére : ${gameState.currentEra}
      - Tour : ${gameState.turnIndex}

      Génère un rapport narratif immersif (TurnNarrative) qui reflète les conséquences des actions du joueur.
      Le ton doit être Cyberpunk-Spatial, teinté d'espoir mais réaliste sur les dangers.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: [
        { role: "user", parts: [{ text: "Génère le rapport de tour basé sur le contexte actuel." }] }
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            body: { type: Type.STRING },
            flavorText: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["STABILITY", "CRISIS", "EXPANSION", "DISCOVERY"] },
            consequences: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  impact: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "body", "category"]
        }
      }
    });

    if (!response.text) {
      throw new Error("Gemini returned empty response");
    }
    const narrative = JSON.parse(response.text);
    return NextResponse.json(narrative);
  } catch (error: any) {
    console.error("Narrative Orchestration Error:", error);
    return NextResponse.json({ error: "Failed to generate narrative" }, { status: 500 });
  }
}
