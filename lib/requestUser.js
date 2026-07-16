import { getSupabaseAdmin } from "./supabaseAdmin";

export async function resolveRequestUser(request, body = null) {
  const authorization = request.headers.get("authorization") || "";
  if (authorization.startsWith("Bearer ")) {
    const token = authorization.slice(7).trim();
    const { data, error } = await getSupabaseAdmin().auth.getUser(token);
    if (error || !data?.user) throw new Error("Sessão inválida ou expirada.");
    return { id: data.user.id, email: data.user.email, mode: "session" };
  }

  const apiKey = request.headers.get("x-api-key");
  if (apiKey && process.env.NUTRICLOCK_API_KEY && apiKey === process.env.NUTRICLOCK_API_KEY) {
    const url = new URL(request.url);
    const requestedUser = request.headers.get("x-user-id") || url.searchParams.get("user_id") || body?.user_id;
    if (!requestedUser) throw new Error("x-user-id ou user_id é obrigatório para integrações externas.");
    return { id: requestedUser, email: null, mode: "api-key" };
  }

  throw new Error("Autenticação obrigatória.");
}
