import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../lib/supabaseAdmin";
import { resolveRequestUser } from "../../../lib/requestUser";

export const dynamic = "force-dynamic";

const CALORIE_GOAL = 1850;

function todayBrazil() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(new Date());
}

export async function GET(request) {

  try {
    const user = await resolveRequestUser(request);
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date") || todayBrazil();

    const start = new Date(`${date}T00:00:00-03:00`).toISOString();
    const endDate = new Date(`${date}T00:00:00-03:00`);
    endDate.setUTCDate(endDate.getUTCDate() + 1);
    const end = endDate.toISOString();

    const { data, error } = await getSupabaseAdmin()
      .from("nutrition_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("occurred_at", start)
      .lt("occurred_at", end)
      .order("occurred_at", { ascending: true });

    if (error) throw error;

    const entries = data || [];

    const totals = entries.reduce(
      (acc, entry) => {
        if (entry.type === "meal") {
          acc.consumed += Number(entry.calories || 0);
          acc.protein_g += Number(entry.protein_g || 0);
          acc.carbs_g += Number(entry.carbs_g || 0);
          acc.fat_g += Number(entry.fat_g || 0);
          acc.fiber_g += Number(entry.fiber_g || 0);
        }

        if (entry.type === "exercise") {
          acc.exercise += Math.abs(Number(entry.calories || 0));
        }

        if (entry.type === "water") {
          acc.water_ml += Number(entry.water_ml || 0);
        }

        if (entry.type === "caffeine") {
          acc.caffeine_mg += Number(entry.caffeine_mg || 0);
        }

        if (entry.type === "weight" && entry.weight_kg != null) {
          acc.weight_kg = Number(entry.weight_kg);
        }

        return acc;
      },
      {
        consumed: 0,
        exercise: 0,
        protein_g: 0,
        carbs_g: 0,
        fat_g: 0,
        fiber_g: 0,
        water_ml: 0,
        caffeine_mg: 0,
        weight_kg: null
      }
    );

    totals.net = totals.consumed - totals.exercise;
    totals.goal = CALORIE_GOAL;
    totals.remaining = CALORIE_GOAL - totals.net;

    return NextResponse.json({
      success: true,
      user_id: user.id,
      date,
      totals,
      entries
    });
  } catch (error) {
    console.error("GET /api/summary:", error);

    return NextResponse.json(
      {
        error: "Não foi possível carregar o resumo.",
        details: error.message
      },
      { status: 500 }
    );
  }
}
