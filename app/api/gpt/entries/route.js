import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../../lib/supabaseAdmin";
import { normalizeEntry, validateEntry } from "../../../../lib/validation";

export const dynamic = "force-dynamic";

function normalizeExerciseCalories(entry) {
  if (entry?.type !== "exercise") return entry;
  return { ...entry, calories: Math.abs(Number(entry.calories || 0)) };
}

function getIntegrationUserId() {
  return (process.env.NUTRICLOCK_GPT_USER_ID || "rafael").trim();
}


export async function GET() {
  return NextResponse.json({
    success: true,
    service: "NutriClock GPT API",
    endpoint: "/api/gpt/entries",
    post_available: true,
    authentication: "none"
  });
}

export async function POST(request) {
  try {
    const userId = getIntegrationUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Usuário da integração não configurado." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const receivedEntries = Array.isArray(body.entries) ? body.entries : [body];
    const entries = receivedEntries.map(normalizeExerciseCalories);

    const errors = entries.flatMap((entry, index) =>
      validateEntry(entry).map((message) => `Registro ${index + 1}: ${message}`)
    );

    if (errors.length > 0) {
      return NextResponse.json(
        { error: "Dados inválidos.", details: errors },
        { status: 400 }
      );
    }

    const rows = entries.map((entry) =>
      normalizeEntry(
        {
          ...entry,
          source: entry.source || "ChatGPT"
        },
        userId
      )
    );

    const { data, error } = await getSupabaseAdmin()
      .from("nutrition_entries")
      .insert(rows)
      .select();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        user_id: userId,
        entries: data || []
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/gpt/entries:", error);
    return NextResponse.json(
      {
        error: "Não foi possível criar o registro pelo GPT.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
