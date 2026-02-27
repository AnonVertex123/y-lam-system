import { createClient, SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | null = null;

export function getSupabaseBrowser() {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  console.log("NEXT_PUBLIC_SUPABASE_URL (client):", url);
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    // Debug presence (no secrets exposed)
    console.error(
      "Supabase env missing in client. url_present=%s, anon_present=%s",
      Boolean(url),
      Boolean(key)
    );
    throw new Error("Thiếu cấu hình NEXT_PUBLIC_SUPABASE_URL/NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }
  try {
    // Basic URL validity check to catch misassignments
    // e.g., URL should look like https://xxxxx.supabase.co
    void new URL(url);
    if (!/supabase\.(co|in)$/i.test(url)) {
      console.warn("NEXT_PUBLIC_SUPABASE_URL trông không giống Supabase URL chuẩn (…supabase.co).");
    }
  } catch {
    console.error("NEXT_PUBLIC_SUPABASE_URL không hợp lệ (không phải URL).");
    throw new Error("Cấu hình Supabase URL không hợp lệ");
  }
  // Validate anon key shape (JWT-like) to catch misassigned publishable keys
  if (key.startsWith("sb_publishable_") || key.split(".").length < 2) {
    console.error("NEXT_PUBLIC_SUPABASE_ANON_KEY không hợp lệ (không phải anon JWT).");
    throw new Error(
      "Cấu hình Supabase ANON_KEY không hợp lệ (cần public anon JWT từ Supabase, không phải 'sb_publishable_…')."
    );
  }
  // Lightweight presence check for debugging
  console.debug(
    "Supabase client init (browser). url_present=%s, anon_present=%s",
    true,
    true
  );
  client = createClient(url, key);
  return client;
}
