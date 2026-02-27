import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";
import { getSupabase } from "@/lib/supabase";

type ScriptItem = {
  type: "TikTok" | "Song Lyrics" | "Report";
  title: string;
  content: string;
};

type ProcessBody = {
  youtubeUrl?: string;
  url?: string;
};

function buildMockTranscription(url: string) {
  const now = new Date();
  const ts = now.toISOString();
  return [
    `Nguồn: ${url}`,
    `Thời điểm xử lý: ${ts}`,
    "",
    "00:00 — Mở đầu: giới thiệu chủ đề và bối cảnh.",
    "00:18 — Điểm nhấn 1: lý do vì sao chủ đề này quan trọng.",
    "00:42 — Điểm nhấn 2: ví dụ minh họa, chi tiết dễ nhớ.",
    "01:12 — Kết: tóm tắt và lời kêu gọi hành động.",
  ].join("\n");
}

function buildMockSummary(originalText: string) {
  const lines = originalText.split("\n").filter(Boolean);
  const head = lines.slice(0, 2).join(" • ");
  return `Tóm tắt: ${head}\n- Ý chính 1: mở đầu và bối cảnh\n- Ý chính 2: 2 điểm nhấn có ví dụ\n- Ý chính 3: kết luận + CTA`;
}

function buildMockScripts(summary: string): ScriptItem[] {
  return [
    {
      type: "TikTok",
      title: "TikTok Hook + 3 Beat",
      content:
        `Hook (0-2s): Một câu gây tò mò.\n` +
        `Beat 1: Nêu vấn đề.\nBeat 2: Ví dụ cụ thể.\nBeat 3: Kết luận.\nCTA: Theo dõi để xem phần tiếp.\n\n${summary}`,
    },
    {
      type: "TikTok",
      title: "TikTok 15s: Before/After",
      content:
        "Before: tình trạng hiện tại.\nAfter: kết quả mong muốn.\nBridge: 2 bước chuyển đổi ngắn.\nCTA: Bình luận từ khóa để nhận checklist.",
    },
    {
      type: "Song Lyrics",
      title: "Song Lyrics (Verse/Chorus)",
      content:
        "Verse 1: kể câu chuyện mở đầu.\nPre-chorus: căng thẳng tăng.\nChorus: thông điệp chính lặp lại.\nVerse 2: thêm hình ảnh ẩn dụ.\nOutro: chốt ý.",
    },
    {
      type: "Report",
      title: "Báo cáo 1 trang",
      content:
        "1) Mục tiêu\n2) Bối cảnh\n3) Phát hiện chính\n4) Hàm ý\n5) Khuyến nghị hành động\n6) Rủi ro & giới hạn",
    },
    {
      type: "Report",
      title: "Executive Summary",
      content:
        "Tổng quan 5 câu.\n3 gạch đầu dòng key takeaways.\n1 gạch đầu dòng next steps.",
    },
  ];
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ProcessBody;
    const url = body.youtubeUrl || body.url;
    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Thiếu link YouTube" }, { status: 400 });
    }

    const supabaseAuth = await getSupabaseServer();
    const {
      data: { user },
    } = await supabaseAuth.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const originalText = buildMockTranscription(url);
    const summary = buildMockSummary(originalText);
    const scripts = buildMockScripts(summary);

    const supabase = getSupabase();
    const { data: row, error } = await supabase
      .from("ylam_history")
      .insert({
        user_id: user.id,
        youtube_url: url,
        original_text: originalText,
        summary,
        scripts,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert ylam_history error:", error);
      return NextResponse.json(
        { error: `Không thể lưu lịch sử. / Failed to save history. (${error.message})` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      historyId: row?.id ?? null,
      originalText,
      summary,
      scripts,
    });
  } catch (e) {
    console.error("API /api/ylam/process error:", e);
    return NextResponse.json({ error: "Lỗi xử lý" }, { status: 500 });
  }
}
