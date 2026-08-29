import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI, Type } from "@google/genai";
import { CycleReportSchema } from "@/src/lib/contracts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const { turnIndex, era, date, canon } = await req.json();
    const ai = new GoogleGenAI({ apiKey });
    const model = (process.env.GEMINI_MODEL_REASONING || "gemini-3.1-pro-preview").replace(/['"]/g, "").trim();

    const prompt = `Tu es l'Observateur Historique de la simulation 'Stellar Genesis: Frontier Archology'.
Rédige la Gazette Décennale et l'arbitrage structurel du Cycle décennal clos au tour ${turnIndex} (${date}) pour l'Ère ${era}.
Faits historiques majeurs du cycle :
${(canon || []).map((c: any) => `- Tour ${c.turn}: ${c.fact}`).join("\n") || "- Consolidation des infrastructures de base."}

Rédige :
1. Un titre d'archive coloniale.
2. Un compte-rendu d'analyse politique, démographique et technologique structuré (150 à 600 mots).
3. Un dilemme structurel pour le prochain cycle avec deux choix polarisants (A et B).
4. Un verdict d'évolution d'Ère.
Retourne un JSON strictly conforme au schéma.`;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            cycleSummary: { type: Type.STRING },
            structuralDilemma: {
              type: Type.OBJECT,
              properties: {
                dilemmaTitle: { type: Type.STRING },
                description: { type: Type.STRING },
                choiceA: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    impactSummary: { type: Type.STRING }
                  },
                  required: ["label", "outcome", "impactSummary"]
                },
                choiceB: {
                  type: Type.OBJECT,
                  properties: {
                    label: { type: Type.STRING },
                    outcome: { type: Type.STRING },
                    impactSummary: { type: Type.STRING }
                  },
                  required: ["label", "outcome", "impactSummary"]
                }
              },
              required: ["dilemmaTitle", "description", "choiceA", "choiceB"]
            },
            eraTransitionVerdict: { type: Type.STRING }
          },
          required: ["title", "cycleSummary", "structuralDilemma"]
        },
        temperature: 0.75,
        maxOutputTokens: 2000
      }
    });

    const parsedJson = JSON.parse(response.text || "{}");
    const validated = CycleReportSchema.safeParse(parsedJson);
    if (!validated.success) {
      return NextResponse.json({ error: "SCHEMA_REJECTED", details: validated.error.issues }, { status: 502 });
    }

    return NextResponse.json(validated.data);
  } catch (err: any) {
    console.error("Cycle report route error:", err);
    return NextResponse.json({ error: "INFERENCE_ERROR", message: err.message }, { status: 500 });
  }
}
