import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "Missing URL" }, { status: 400 });
    }

    // 1. Phân loại Link
    const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
    const isTiktok = url.includes("tiktok.com") || url.includes("vt.tiktok.com");

    // 2. Xử lý YouTube (Giữ logic cũ nhưng đưa vào cấu trúc mới)
    if (isYoutube) {
      const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
      const match = url.match(youtubeRegex);
      const videoId = match ? match[1] : null;

      if (!videoId) {
        return NextResponse.json({ error: "Link YouTube không hợp lệ" }, { status: 400 });
      }

      try {
        const transcriptParts = await YoutubeTranscript.fetchTranscript(videoId, { lang: "vi" });
        const text = transcriptParts.map(p => p.text).join(" ").trim();
        return NextResponse.json({ type: "video", source: "youtube", content: text });
      } catch (err) {
        // Thử lại không giới hạn ngôn ngữ
        try {
          const transcriptParts = await YoutubeTranscript.fetchTranscript(videoId);
          const text = transcriptParts.map(p => p.text).join(" ").trim();
          return NextResponse.json({ type: "video", source: "youtube", content: text });
        } catch (finalErr) {
          return NextResponse.json({ error: "Video này không có phụ đề để bóc tách." }, { status: 400 });
        }
      }
    }

    // 3. Xử lý TikTok (Placeholder cho tương lai)
    if (isTiktok) {
      return NextResponse.json({ error: "Linh hồn của TikTok vẫn còn là một ẩn số đối với tôi, hãy dùng link YouTube hoặc bài báo nhé!" }, { status: 400 });
    }

    // 4. Xử lý Bài báo/Web qua Jina Reader
    try {
      const jinaUrl = `https://r.jina.ai/${url}`;
      const response = await fetch(jinaUrl, {
        headers: {
          "Accept": "application/json",
          "X-No-Cache": "true"
        }
      });

      if (!response.ok) {
        throw new Error("Jina Reader failed");
      }

      const data = await response.json();
      const content = data.data?.content || data.content || "";

      if (!content) {
        return NextResponse.json({ error: "Ý Lâm không thể đọc được nội dung từ liên kết này." }, { status: 400 });
      }

      return NextResponse.json({ type: "article", source: "web", content: content });
    } catch (webErr) {
      console.error("Web Ingest Error:", webErr);
      return NextResponse.json({ error: "Liên kết không được hỗ trợ hoặc Ý Lâm không thể truy cập." }, { status: 400 });
    }

  } catch (error: any) {
    console.error("Ingest API Error:", error);
    return NextResponse.json({ error: "Hệ thống bóc tách gặp sự cố bất ngờ." }, { status: 500 });
  }
}
