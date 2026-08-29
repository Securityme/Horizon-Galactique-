import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { TurnRequestSchema, TurnNarrativeSchema } from "@/src/lib/contracts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const rawBody = await req.json();
    const parsed = TurnRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_PAYLOAD", details: parsed.error.issues }, { status: 400 });
    }

    const { context } = parsed.data;
    const ai = new GoogleGenAI({ apiKey });
    const model = (process.env.GEMINI_MODEL_FAST || "gemini-3.5-flash").replace(/['"]/g, "").trim();

    const prompt = `Tu es le moteur narratif central (Dual-Loop) de la simulation 4X sci-fi 'Stellar Genesis: Frontier Archology'.
Génère la chronique du tour actuel pour le Livre actif : ${context.activeBook}.
Détails de la simulation :
- Ère : ${context.era} | Échelle : ${context.turnScale} | Date : ${context.colonyDate} | Tour : ${context.turnIndex} (Cycle : ${context.cycleIndex}/10)
- Carte de Destin : « ${context.destinyCard.label} » (${context.destinyCard.flavor})
- Résultat du jet D20 : Dé naturel ${context.rollOutcome.natural}, Total ${context.rollOutcome.total} (DD ${context.rollOutcome.dc}) -> Degré : ${context.rollOutcome.degree}
- État de la colonie : Pop ${context.state.popTotal}, Énergie Nette ${context.state.netEnergyMW} MW, Bonheur ${context.state.happiness}/100, Criminalité ${context.state.crime}%, Terraformation ${context.state.terraformPct}%, Trésorerie ${context.state.treasury} crédits, Santé Leader ${context.state.leaderHealth}%, Stress Leader ${context.state.leaderStress}%.
- Options pré-calculées :
${context.precomputedEffects.map((e) => `  * ${e.id}: ${e.label} (${e.bodyPreview})`).join("\n")}
- Faits historiques récents : ${context.canon.map((c) => `[T${c.turn}] ${c.fact}`).join("; ") || "Aucun"}

Consignes impératives :
1. Rédige un titre percutant (4 à 80 caractères) et un récit immersif de haute tenue littéraire sci-fi (120 à 1000 caractères) en français.
2. Propose 2 à 3 options correspondant exactement aux effectId déclarés ('EFF-A', 'EFF-B', 'EFF-C').
3. Si le jet est critique (naturel 1 ou 20), propose une phrase courte pour le fait historique (canonCandidate).
4. Retourne un JSON strictement valide conforme au schéma.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            bookId: {
              type: Type.STRING,
              enum: [
                "LIV-01", "LIV-02", "LIV-03", "LIV-04", "LIV-05",
                "LIV-06", "LIV-07", "LIV-08", "LIV-09", "LIV-10"
              ]
            },
            title: { type: Type.STRING },
            body: { type: Type.STRING },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  effectId: { type: Type.STRING, enum: ["EFF-A", "EFF-B", "EFF-C"] },
                  label: { type: Type.STRING },
                  body: { type: Type.STRING },
                  riskHint: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH"] }
                },
                required: ["effectId", "label", "body", "riskHint"]
              }
            },
            rebounds: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  bookId: {
                    type: Type.STRING,
                    enum: [
                      "LIV-01", "LIV-02", "LIV-03", "LIV-04", "LIV-05",
                      "LIV-06", "LIV-07", "LIV-08", "LIV-09", "LIV-10"
                    ]
                  },
                  body: { type: Type.STRING }
                },
                required: ["bookId", "body"]
              }
            },
            canonCandidate: { type: Type.STRING, nullable: true }
          },
          required: ["bookId", "title", "body", "options", "rebounds"]
        },
        temperature: 0.85,
        maxOutputTokens: 1400
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    const validated = TurnNarrativeSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.warn("Zod schema validation failed for generated turn narrative:", validated.error);
      return NextResponse.json({ error: "SCHEMA_REJECTED", details: validated.error.issues }, { status: 502 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("Turn narrative route error:", err);
    return NextResponse.json({ error: "INFERENCE_ERROR", message: err.message }, { status: 500 });
  }
}
