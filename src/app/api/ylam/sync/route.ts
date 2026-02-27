import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { getSupabaseServer } from "@/lib/supabase-server";
import { eccEncrypt } from "@/lib/ecc";

type SyncEntry = {
  source_id: string;
  raw_transcript: string;
  core_summary: string;
  vector_embedding: number[];
  generated_content: unknown;
};

type SyncBody = { entries: SyncEntry[] };

function getRecipientPem() {
  const pem = process.env.YLAM_ECC_PUBLIC_KEY_PEM || process.env.ECC_PUBLIC_KEY_PEM;
  if (!pem) throw new Error("Thiếu ECC public key");
  return pem;
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as SyncBody;
    if (!Array.isArray(body.entries)) {
      return NextResponse.json({ error: "Thiếu entries" }, { status: 400 });
    }
    const supabaseAuth = await getSupabaseServer();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabase();
    const pem = getRecipientPem();
    const rows = [];
    for (const e of body.entries) {
      const enc = await eccEncrypt(
        JSON.stringify({
          userId: user.id,
          raw_transcript: e.raw_transcript,
          core_summary: e.core_summary,
          generated_content: e.generated_content,
        }),
        pem
      );
      rows.push({
        source_id: e.source_id,
        user_id: user.id,
        raw_transcript: "",
        core_summary: "",
        vector_embedding: e.vector_embedding,
        generated_content: { enc, userId: user.id, v: 1 },
      });
    }
    const { error } = await supabase.from("knowledge_vault").upsert(rows, { onConflict: "source_id" });
    if (error) {
      return NextResponse.json({ error: "Lỗi lưu trữ" }, { status: 500 });
    }
    return NextResponse.json({ ok: true, count: rows.length });
  } catch {
    return NextResponse.json({ error: "Lỗi đồng bộ" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const supabaseAuth = await getSupabaseServer();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("knowledge_vault")
      .select("source_id, vector_embedding, generated_content")
      .eq("user_id", user.id)
      .limit(1000);
    if (error) {
      return NextResponse.json({ error: "Lỗi truy vấn" }, { status: 500 });
    }
    return NextResponse.json({ userId: user.id, items: data ?? [] });
  } catch {
    return NextResponse.json({ error: "Lỗi tải xuống" }, { status: 500 });
  }
}
