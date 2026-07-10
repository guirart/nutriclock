import { NextResponse } from "next/server";

export function requireApiKey(request) {
  const configured = process.env.NUTRICLOCK_API_KEY;
  if (!configured) {
    return NextResponse.json(
      { error: "NUTRICLOCK_API_KEY não configurada no servidor." },
      { status: 500 }
    );
  }

  const header =
    request.headers.get("x-api-key") ||
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!header || header !== configured) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  return null;
}
