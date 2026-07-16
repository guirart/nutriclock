import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { normalizeEntry, validateEntry } from "../../../lib/validation";
import { resolveRequestUser } from "../../../lib/requestUser";

export const dynamic = "force-dynamic";


function normalizeExerciseCalories(entry) {
  if (entry?.type !== "exercise") return entry;

  return {
    ...entry,
    calories: Math.abs(Number(entry.calories || 0))
  };
}

export async function GET(request) {

  try {
    const user = await resolveRequestUser(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const rawLimit = Number(searchParams.get("limit") || 500);
    const limit = Number.isFinite(rawLimit)
      ? Math.min(Math.max(rawLimit, 1), 500)
      : 500;

    let query = getSupabaseAdmin()
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (date) {
      const start = new Date(`${date}T00:00:00-03:00`).toISOString();
      const end = new Date(`${date}T23:59:59.999-03:00`).toISOString();

      query = query
        .gte("occurred_at", start)
        .lte("occurred_at", end);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({
      success: true,
      user_id: user.id,
      entries: data || []
    });
  } catch (error) {
    console.error("GET /api/entries:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar os registros.",
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {

  try {
    const body = await request.json();
    const user = await resolveRequestUser(request, body);
    const receivedEntries = Array.isArray(body.entries)
      ? body.entries
      : [body];

    const entries = receivedEntries.map(normalizeExerciseCalories);

    const errors = entries.flatMap((entry, index) =>
      validateEntry(entry).map(
        (message) => `Registro ${index + 1}: ${message}`
      )
    );

    if (errors.length > 0) {
      return NextResponse.json(
        {
          error: "Dados inválidos.",
          details: errors
        },
        { status: 400 }
      );
    }

    const rows = entries.map((entry) =>
      normalizeEntry(entry, user.id)
    );

    const { data, error } = await getSupabaseAdmin()
      .from("nutrition_entries")
      .insert(rows)
      .select();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        entries: data || []
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/entries:", error);

    return NextResponse.json(
      {
        error: "Não foi possível criar o registro.",
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {

  try {
    const body = await request.json();
    const user = await resolveRequestUser(request, body);
    const { id, ...changes } = body;

    if (!id) {
      return NextResponse.json(
        { error: "id obrigatório." },
        { status: 400 }
      );
    }

    const allowed = [
      "type",
      "description",
      "calories",
      "protein_g",
      "carbs_g",
      "fat_g",
      "fiber_g",
      "water_ml",
      "caffeine_mg",
      "weight_kg",
      "confidence",
      "notes",
      "source",
      "occurred_at"
    ];

    const update = Object.fromEntries(
      Object.entries(changes).filter(([key]) =>
        allowed.includes(key)
      )
    );

    const currentType = update.type || changes.type;
    if (currentType === "exercise" && "calories" in update) {
      update.calories = Math.abs(Number(update.calories || 0));
    }

    const { data, error } = await getSupabaseAdmin()
      .from("nutrition_entries")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      entry: data
    });
  } catch (error) {
    console.error("PATCH /api/entries:", error);

    return NextResponse.json(
      {
        error: "Não foi possível atualizar o registro.",
        details: error.message
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {

  try {
    const user = await resolveRequestUser(request);
    const id = new URL(request.url).searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id obrigatório." },
        { status: 400 }
      );
    }

    const { error } = await getSupabaseAdmin()
      .from("nutrition_entries")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/entries:", error);

    return NextResponse.json(
      {
        error: "Não foi possível excluir o registro.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
