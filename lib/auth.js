import { NextResponse } from "next/server";

function clean(value = "") {
  return value.trim().replace(/^Bearer\s+/i, "").trim();
}

export function requireApiKey(request) {
  const expected = clean(process.env.NUTRICLOCK_API_KEY || "");

  if (!expected) {
    return NextResponse.json(
      { error: "NUTRICLOCK_API_KEY não configurada." },
      { status: 500 }
    );
  }

  const supplied = [
    request.headers.get("authorization"),
    request.headers.get("x-api-key"),
    request.headers.get("api-key"),
    request.headers.get("x-nutriclock-key")
  ].filter(Boolean).map(clean);

  if (!supplied.includes(expected)) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return null;
}
