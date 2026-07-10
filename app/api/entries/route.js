import { NextResponse } from "next/server";
import { requireApiKey } from "../../../lib/auth";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { normalizeEntry, validateEntry } from "../../../lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const supabase = getSupabaseAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || process.env.NUTRICLOCK_USER_ID || "rafael";
    const date = searchParams.get("date");
    const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

    let query = supabase
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", userId)
      .order("occurred_at", { ascending: false })
      .limit(limit);

    if (date) {
      const start = new Date(`${date}T00:00:00-03:00`).toISOString();
      const end = new Date(`${date}T23:59:59.999-03:00`).toISOString();
      query = query.gte("occurred_at", start).lte("occurred_at", end);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ entries: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const entries = Array.isArray(body.entries) ? body.entries : [body];
    const userId = body.user_id || process.env.NUTRICLOCK_USER_ID || "rafael";

    const errors = entries.flatMap((entry, index) =>
      validateEntry(entry).map((message) => `Registro ${index + 1}: ${message}`)
    );
    if (errors.length) {
      return NextResponse.json({ error: "Dados inválidos.", details: errors }, { status: 400 });
    }

    const rows = entries.map((entry) => normalizeEntry(entry, userId));
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("nutrition_entries")
      .insert(rows)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, entries: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id obrigatório." }, { status: 400 });

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("nutrition_entries").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


export async function PATCH(request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { id, ...changes } = body;

    if (!id) {
      return NextResponse.json({ error: "id obrigatório." }, { status: 400 });
    }

    const allowed = [
      "type", "description", "calories", "protein_g", "carbs_g", "fat_g",
      "fiber_g", "water_ml", "caffeine_mg", "weight_kg", "confidence",
      "notes", "source", "occurred_at"
    ];

    const update = Object.fromEntries(
      Object.entries(changes).filter(([key]) => allowed.includes(key))
    );

    if (!Object.keys(update).length) {
      return NextResponse.json({ error: "Nenhum campo válido para atualizar." }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("nutrition_entries")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, entry: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
