import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { ContextualEventRequestSchema, ContextualEventSchema } from "@/src/lib/contracts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const rawBody = await req.json();
    const parsed = ContextualEventRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_PAYLOAD", details: parsed.error.issues }, { status: 400 });
    }

    const { colonyState } = parsed.data;
    const ai = new GoogleGenAI({ apiKey });
    const model = (process.env.GEMINI_MODEL_FAST || "gemini-3.5-flash").replace(/['"]/g, "").trim();

    const prompt = `Tu es le moteur d'incidents narrative Gemini de 'Stellar Genesis: Frontier Archology'.
Génère un événement narratif hautement contextuel basé sur l'état exact des ressources et de la population de la colonie.

Données actuelles de la colonie :
- Planète : ${colonyState.planetId} | Ère : ${colonyState.era} | Tour : ${colonyState.turnIndex} (${colonyState.colonyDate})
- Population totale : ${colonyState.popTotal} colons (Répartition: T0 Extraction=${colonyState.tiers.t0}, T1 Usines=${colonyState.tiers.t1}, T2 Santé=${colonyState.tiers.t2}, T3 Chercheurs=${colonyState.tiers.t3})
- Bilan énergétique net : ${colonyState.netEnergyMW} MW
- Périmètre respirable : ${colonyState.respirableHa} ha | Terraformation : ${colonyState.terraformPct}%
- Trésorerie : ${colonyState.treasury} crédits
- Bonheur : ${colonyState.happiness}/100 | Criminalité : ${colonyState.crime}%
- Leader : Santé ${colonyState.leaderHealth}%, Stress ${colonyState.leaderStress}%

Consignes :
1. Analyse la situation : si l'énergie est négative, s'il y a surpopulation ou fort stress du Leader, ou au contraire si la colonie prospère, crée un incident ou une opportunité narrative sci-fi immersive.
2. Détermine la catégorie ("COLONY", "THREATS", "LEADER", ou "AI_CHRONICLES") et la gravité ("INFO", "WARNING", "CRITICAL", "SUCCESS").
3. Rédige un titre percutant, un récit de 2 à 4 paragraphes immersifs en français, un résumé court d'impact et 2 à 3 tags pertinents.
4. Propose 2 options de décision pour le Leader avec leurs répercussions estimées sur l'énergie, la trésorerie, le bonheur et le stress.
5. Renvoie un objet JSON strictement conforme au schéma fourni.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            title: { type: Type.STRING },
            category: { type: Type.STRING, enum: ["COLONY", "THREATS", "LEADER", "AI_CHRONICLES"] },
            severity: { type: Type.STRING, enum: ["INFO", "WARNING", "CRITICAL", "SUCCESS"] },
            body: { type: Type.STRING },
            impactSummary: { type: Type.STRING },
            tags: { type: Type.ARRAY, items: { type: Type.STRING } },
            options: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deltaEnergy: { type: Type.NUMBER },
                  deltaTreasury: { type: Type.NUMBER },
                  deltaHappiness: { type: Type.NUMBER },
                  deltaStress: { type: Type.NUMBER }
                },
                required: ["label", "description", "deltaEnergy", "deltaTreasury", "deltaHappiness", "deltaStress"]
              }
            }
          },
          required: ["id", "title", "category", "severity", "body", "impactSummary", "tags", "options"]
        },
        temperature: 0.85,
        maxOutputTokens: 1200
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    const validated = ContextualEventSchema.safeParse(parsedJson);
    if (!validated.success) {
      console.warn("Zod validation failed for contextual event:", validated.error);
      return NextResponse.json({ error: "SCHEMA_REJECTED", details: validated.error.issues }, { status: 502 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("Contextual event generation error:", err);
    return NextResponse.json({ error: "INFERENCE_ERROR", message: err.message }, { status: 500 });
  }
}
