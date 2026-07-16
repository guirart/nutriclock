import { NextRequest, NextResponse } from "next/server";
import { resolveRequestUser } from "../../../../lib/requestUser";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Modelo fixado no servidor. A única variável necessária para a IA é OPENAI_API_KEY.
const MODEL = "gpt-4.1-mini";
const MAX_IMAGE_DATA_URL_LENGTH = 12_000_000;

type AnalyzeMealRequest = {
  image?: unknown;
  message?: unknown;
};

type OpenAIErrorPayload = {
  error?: {
    message?: string;
  };
};

type OpenAIChatCompletionPayload = OpenAIErrorPayload & {
  choices?: Array<{
    message?: {
      content?: string | null;
    };
  }>;
};

const mealSchema = {
  name: "meal_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      assistant_message: { type: "string" },
      meal_name: { type: "string" },
      foods: {
        type: "array",
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            estimated_grams: { type: "number" },
            calories: { type: "number" },
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fat_g: { type: "number" },
            confidence: { type: "string", enum: ["low", "medium", "high"] }
          },
          required: [
            "name",
            "estimated_grams",
            "calories",
            "protein_g",
            "carbs_g",
            "fat_g",
            "confidence"
          ]
        }
      },
      totals: {
        type: "object",
        additionalProperties: false,
        properties: {
          calories: { type: "number" },
          protein_g: { type: "number" },
          carbs_g: { type: "number" },
          fat_g: { type: "number" },
          fiber_g: { type: "number" }
        },
        required: ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g"]
      },
      confidence: { type: "string", enum: ["low", "medium", "high"] },
      warnings: { type: "array", items: { type: "string" } }
    },
    required: ["assistant_message", "meal_name", "foods", "totals", "confidence", "warnings"]
  }
} as const;

export async function POST(request: NextRequest) {
  try {
    await resolveRequestUser(request);

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY não configurada na Vercel." },
        { status: 503 }
      );
    }

    const body = (await request.json()) as AnalyzeMealRequest;
    const image = typeof body.image === "string" ? body.image : "";
    const message = typeof body.message === "string" ? body.message.trim() : "";

    if (!image && !message) {
      return NextResponse.json({ error: "Envie uma foto ou mensagem." }, { status: 400 });
    }

    if (image && image.length > MAX_IMAGE_DATA_URL_LENGTH) {
      return NextResponse.json(
        { error: "Imagem muito grande. Use uma foto menor que 8 MB." },
        { status: 413 }
      );
    }

    const content: Array<Record<string, unknown>> = [
      {
        type: "text",
        text: `Você é o NutriAssist, assistente nutricional do NutriClock. Analise refeições com cautela. Estime para cima quando houver incerteza, mas não invente ingredientes invisíveis. Identifique alimentos, porções prováveis, calorias e macros. Responda em português do Brasil. A análise é estimativa visual e deve trazer avisos sobre óleo, molhos ou porções incertas. Contexto do usuário: ${message || "Analise a foto enviada."}`
      }
    ];

    if (image) {
      content.push({
        type: "image_url",
        image_url: { url: image, detail: "high" }
      });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content }],
        response_format: { type: "json_schema", json_schema: mealSchema },
        temperature: 0.2,
        max_tokens: 1600
      })
    });

    const payload = (await openaiResponse.json()) as OpenAIChatCompletionPayload;

    if (!openaiResponse.ok) {
      throw new Error(payload.error?.message || "Falha na análise da OpenAI.");
    }

    const text = payload.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error("A OpenAI não retornou uma análise válida.");
    }

    return NextResponse.json({ success: true, analysis: JSON.parse(text) });
  } catch (error: unknown) {
    const details = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("POST /api/ai/analyze-meal:", error);
    return NextResponse.json(
      { error: "Não foi possível analisar a refeição.", details },
      { status: 500 }
    );
  }
}
