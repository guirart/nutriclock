import { createClient } from "@supabase/supabase-js";

let browserClient;

export function getSupabaseBrowserConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  return { url, key };
}

export function getSupabaseBrowser() {
  if (browserClient) return browserClient;
  const config = getSupabaseBrowserConfig();
  if (!config) return null;

  browserClient = createClient(config.url, config.key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "nutriclock-auth-v11"
    }
  });
  return browserClient;
}
