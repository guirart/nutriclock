import { NextResponse } from "next/server";

function normalize(value = "") {
  return value.trim().replace(/^Bearer\s+/i, "").trim();
}

export function requireApiKey(request) {
  const configured = normalize(process.env.NUTRICLOCK_API_KEY || "");

  if (!configured) {
    return NextResponse.json(
      { error: "NUTRICLOCK_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const candidates = [
    request.headers.get("authorization"),
    request.headers.get("x-api-key"),
    request.headers.get("api-key"),
    request.headers.get("x-nutriclock-key")
  ]
    .filter(Boolean)
    .map(normalize);

  if (!candidates.includes(configured)) {
    return NextResponse.json(
      {
        error: "Não autorizado.",
        hint: "Envie a chave como Authorization: Bearer <chave> ou X-API-Key: <chave>."
      },
      { status: 401 }
    );
  }

  return null;
}
