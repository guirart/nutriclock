import { NextResponse } from "next/server";

const nutritionEntrySchema = {
  type: "object",
  required: ["type", "description"],
  properties: {
    type: {
      type: "string",
      enum: ["meal", "exercise", "water", "caffeine", "weight"]
    },
    description: { type: "string" },
    calories: { type: "number" },
    protein_g: { type: "number" },
    carbs_g: { type: "number" },
    fat_g: { type: "number" },
    fiber_g: { type: "number" },
    water_ml: { type: "number" },
    caffeine_mg: { type: "number" },
    weight_kg: { type: ["number", "null"] },
    confidence: { type: "string" },
    notes: { type: ["string", "null"] },
    source: { type: "string" },
    occurred_at: { type: "string", format: "date-time" }
  }
};

const baseSpec = {
  openapi: "3.1.0",
  info: {
    title: "NutriClock GPT Registration API",
    version: "5.0.0",
    description:
      "Rota exclusiva para o GPT registrar refeições, exercícios, água, cafeína e peso no NutriClock. Não exige login, sessão ou chave de API. Por segurança, esta integração não permite consultar, editar ou excluir registros."
  },
  servers: [{ url: "https://nutriclock.vercel.app" }],
  paths: {
    "/api/gpt/entries": {
      post: {
        operationId: "createNutritionEntry",
        summary: "Registrar uma ou mais entradas no NutriClock",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                oneOf: [
                  nutritionEntrySchema,
                  {
                    type: "object",
                    required: ["entries"],
                    properties: {
                      entries: {
                        type: "array",
                        minItems: 1,
                        items: nutritionEntrySchema
                      }
                    }
                  }
                ]
              }
            }
          }
        },
        responses: {
          "201": { description: "Registro criado com sucesso." },
          "400": { description: "Dados inválidos." },
          "500": { description: "Erro interno ao registrar." }
        }
      }
    }
  }
};

export async function GET(request) {
  const spec = structuredClone(baseSpec);
  spec.servers = [{ url: new URL(request.url).origin }];
  return NextResponse.json(spec);
}
