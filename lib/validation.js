const TYPES = ["meal", "exercise", "water", "caffeine", "weight"];

export function validateEntry(input) {
  const errors = [];
  if (!input || typeof input !== "object") errors.push("Corpo inválido.");
  if (!TYPES.includes(input?.type)) errors.push("type inválido.");
  if (!input?.description || typeof input.description !== "string") {
    errors.push("description é obrigatória.");
  }

  const numericFields = [
    "calories", "protein_g", "carbs_g", "fat_g", "fiber_g",
    "water_ml", "caffeine_mg", "weight_kg"
  ];

  for (const field of numericFields) {
    if (input?.[field] != null && Number.isNaN(Number(input[field]))) {
      errors.push(`${field} deve ser numérico.`);
    }
  }

  if (input?.occurred_at && Number.isNaN(Date.parse(input.occurred_at))) {
    errors.push("occurred_at deve ser uma data ISO válida.");
  }

  return errors;
}

export function normalizeEntry(input, userId) {
  return {
    user_id: userId,
    type: input.type,
    description: input.description.trim(),
    calories: Number(input.calories || 0),
    protein_g: Number(input.protein_g || 0),
    carbs_g: Number(input.carbs_g || 0),
    fat_g: Number(input.fat_g || 0),
    fiber_g: Number(input.fiber_g || 0),
    water_ml: Number(input.water_ml || 0),
    caffeine_mg: Number(input.caffeine_mg || 0),
    weight_kg: input.weight_kg == null ? null : Number(input.weight_kg),
    confidence: input.confidence || "medium",
    notes: input.notes || null,
    source: input.source || "chatgpt",
    occurred_at: input.occurred_at || new Date().toISOString()
  };
}
