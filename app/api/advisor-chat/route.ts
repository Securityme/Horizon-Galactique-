import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AdvisorChatRequestSchema } from "@/src/lib/contracts";

export const dynamic = "force-dynamic";

const PERSONA_PROMPTS: Record<string, string> = {
  TACTICAL: "Tu es le Conseiller Tactique et Sécurité Militaire de l'archologie. Tu analyses les risques sismiques, la criminalité, les garnisons, la loyauté des milices et les incidents de frontière avec pragmatisme martial et brièveté.",
  SCIENCE: "Tu es la Haute Scientifique en chef. Tu es passionnée par la terraformation, les fracturations ISRU, les anomalies physiques, les réacteurs à fusion et l'arbre de recherche R&D.",
  LOGISTICS: "Tu es le Directeur Général de la Logistique et du Réseau. Tu supervises les 9 utilités (énergie, O2, eau, flux de données), le transport, l'évacuation des scories et la viabilité des parcelles.",
  CIVIC: "Tu es le Délégué aux Affaires Civiques et Démographiques. Tu défends le bien-être, le bonheur des cohortes T0-T3, les quotas migratoires, la santé publique et les réformes sociopolitiques.",
  HISTORIAN: "Tu es le Grand Chroniqueur de la Dynastie. Tu veilles sur le Grand Livre (LIV-10), la légitimité du Leader, les archives canoniques, les traditions et le destin à long terme de la civilisation."
};

export async function POST(req: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const rawBody = await req.json();
    const parsed = AdvisorChatRequestSchema.safeParse(rawBody);
    if (!parsed.success) {
      return NextResponse.json({ error: "INVALID_PAYLOAD", details: parsed.error.issues }, { status: 400 });
    }

    const { persona, messages, colonySummary } = parsed.data;
    const ai = new GoogleGenAI({ apiKey });
    const model = (process.env.GEMINI_MODEL_CHAT || "gemini-3.5-flash").replace(/['"]/g, "").trim();

    const systemInstruction = `${PERSONA_PROMPTS[persona] || PERSONA_PROMPTS.CIVIC}
Tu réponds en français, avec concision (1 à 3 paragraphes), dans le ton immersif de la sci-fi 'Stellar Genesis'.
État actuel de la colonie :
- Ère : ${colonySummary.era} | Tour : ${colonySummary.turnIndex} (${colonySummary.colonyDate})
- Population : ${colonySummary.popTotal} colons | Énergie nette : ${colonySummary.netEnergyMW} MW | Terraformation : ${colonySummary.terraformPct}%
- Trésorerie : ${colonySummary.treasury} crédits | Crédits privés Leader : ${colonySummary.privateCredits} | Consortium : ${colonySummary.consortiumCredits}
- Bonheur : ${colonySummary.happiness}/100 | Criminalité : ${colonySummary.crime}% | Santé Leader : ${colonySummary.leaderHealth}% | Stress : ${colonySummary.leaderStress}%
- Secteur d'activité actif : ${colonySummary.activeBook}`;

    // Format chat contents
    const contents = messages.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    const response = await ai.models.generateContent({
      model,
      contents,
      config: {
        systemInstruction,
        temperature: 0.7,
        maxOutputTokens: 800
      }
    });

    return NextResponse.json({
      role: "model",
      content: response.text || "Aucune réponse disponible du conseiller."
    });
  } catch (err: any) {
    console.error("Advisor chat route error:", err);
    return NextResponse.json({ error: "CHAT_INFERENCE_ERROR", message: err.message }, { status: 500 });
  }
}
