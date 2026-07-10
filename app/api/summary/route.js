import { NextResponse } from "next/server";
import { requireApiKey } from "../../../lib/auth";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";

export const dynamic = "force-dynamic";

function todayBrazil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export async function GET(request) {
  const authError = requireApiKey(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id") || process.env.NUTRICLOCK_USER_ID || "rafael";
    const date = searchParams.get("date") || todayBrazil();

    const start = new Date(`${date}T00:00:00-03:00`).toISOString();
    const end = new Date(`${date}T23:59:59.999-03:00`).toISOString();

    const { data, error } = await getSupabaseAdmin()
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("occurred_at", start)
      .lte("occurred_at", end)
      .order("occurred_at", { ascending: true });

    if (error) throw error;

    const totals = data.reduce((acc, entry) => {
      if (entry.type === "meal") {
        acc.consumed += Number(entry.calories || 0);
        acc.protein_g += Number(entry.protein_g || 0);
        acc.carbs_g += Number(entry.carbs_g || 0);
        acc.fat_g += Number(entry.fat_g || 0);
        acc.fiber_g += Number(entry.fiber_g || 0);
      }
      if (entry.type === "exercise") acc.exercise += Number(entry.calories || 0);
      if (entry.type === "water") acc.water_ml += Number(entry.water_ml || 0);
      if (entry.type === "caffeine") acc.caffeine_mg += Number(entry.caffeine_mg || 0);
      if (entry.type === "weight" && entry.weight_kg) acc.weight_kg = Number(entry.weight_kg);
      return acc;
    }, {
      consumed:0, exercise:0, protein_g:0, carbs_g:0, fat_g:0,
      fiber_g:0, water_ml:0, caffeine_mg:0, weight_kg:null
    });

    totals.net = totals.consumed - totals.exercise;
    totals.goal = 1850;
    totals.remaining = totals.goal - totals.net;

    return NextResponse.json({ date, totals, entries: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
