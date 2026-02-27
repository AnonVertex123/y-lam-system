import { NextResponse } from "next/server";
import { validateGoogleStudioKey } from "@/lib/gemini";

type Body = { key?: string };

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;
    const key = typeof body.key === "string" ? body.key.trim() : "";
    if (!key) {
      return NextResponse.json({ ok: false, error: "Missing key" }, { status: 400 });
    }
    const ok = await validateGoogleStudioKey(key);
    return NextResponse.json({ ok });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
