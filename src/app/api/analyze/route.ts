import { NextRequest, NextResponse } from "next/server";
import { YoutubeTranscript } from "youtube-transcript";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ytDl from "yt-dlp-exec";

export const ANALYZE_SYSTEM_PROMPT = `
Bạn là Tự Minh (Lucian) – một chuyên gia phân tích sắc sảo và nghệ sĩ ngôn từ tài ba của Ý Lâm.
Nhiệm vụ của bạn là bóc tách tri thức từ các nguồn dữ liệu đa phương thức (Video, Bài báo, Văn bản, Audio).

Yêu cầu bóc tách:
1. Hãy đóng vai một chuyên gia phân tích và nghệ sĩ tài ba, biến nội dung này thành một bài luận báo chí sắc sảo, mạch lạc và giàu tính triết lý.
2. Ngôn ngữ: Tiếng Việt, sang trọng, mang phong thái của một Digital Press (Báo chí số).
3. Cấu trúc: Có tiêu đề cuốn hút, các đoạn phân tích sâu sắc, và thông điệp triết lý cuối cùng.
  4. Đối với Audio: Hãy lắng nghe linh hồn âm thanh của video này, bóc tách toàn bộ ca từ, lời thoại và ý niệm để chuyển thành văn bản cho Hùng Đại.
  5. Triệt tiêu tạp niệm: Loại bỏ các thông tin rác, chỉ giữ lại tinh hoa tri thức.
`;

export async function POST(req: NextRequest) {
  try {
    const { url, userPrompt, apiKey: bodyApiKey } = await req.json();

    if (!url) {
      return NextResponse.json({ error: "Missing URL or Text" }, { status: 400 });
    }

    // Sử dụng API Key từ body (User-provided) hoặc fallback về Env (System-provided)
    const apiKey = bodyApiKey || process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Ý Lâm cần Năng lượng (API Key) để khởi động trí tuệ. Hãy thiết lập trong Hồ sơ hoặc kiểm tra biến môi trường." }, { status: 400 });
    }

    let rawContent: any = "";
    let sourceType = "unknown";
    let isAudioFlow = false;

    // 1. Phân loại Link/Text ngay từ đầu
    const isUrl = /^(http|https):\/\/[^ " ]+$/.test(url);

    if (isUrl) {
      // LUỒNG A: Xử lý Link (YouTube/Web)
      const isYoutube = url.includes("youtube.com") || url.includes("youtu.be");
      const isLongevity = url.includes("longevity.com.vn") || url.includes("truongtho.vn");

      if (isYoutube) {
        sourceType = "video";
        // THIẾT LẬP MẠCH TRÍCH XUẤT AUDIO THỰC TẾ
        console.log("Extracting high-quality audio stream via yt-dlp...");
        try {
          const output = await ytDl(url, {
            dumpSingleJson: true,
            noCheckCertificate: true,
            noWarnings: true,
            preferFreeFormats: true,
            format: 'bestaudio',
            addHeader: 'referer:youtube.com',
          });
          
          const audioFormat = output.formats.find((f: any) => f.vcodec === 'none' && (f.ext === 'm4a' || f.ext === 'mp3'));
          const audioUrl = audioFormat ? audioFormat.url : null;

          if (audioUrl) {
            const audioRes = await fetch(audioUrl);
            const audioBuffer = await audioRes.arrayBuffer();
            rawContent = Buffer.from(audioBuffer).toString("base64");
            isAudioFlow = true;
          } else {
            throw new Error("AUDIO_STREAM_NOT_FOUND");
          }
        } catch (ytDlErr: any) {
          console.error("yt-dlp Extraction Failed:", ytDlErr);
          return NextResponse.json({ 
            error: "Hùng Đại ơi, tường lửa của video này quá mạnh, Ý Lâm chưa nghe thấy gì, bạn thử link khác xem sao hihihi",
            code: "FIREWALL_BLOCKED" 
          }, { status: 400 });
        }
      } else {
        sourceType = isLongevity ? "longevity_article" : "article";
        try {
          const jinaUrl = `https://r.jina.ai/${url}`;
          const jinaRes = await fetch(jinaUrl, { headers: { "Accept": "application/json" } });
          if (jinaRes.ok) {
            const data = await jinaRes.json();
            rawContent = data.data?.content || data.content || "";
          } else {
            const textRes = await fetch(jinaUrl);
            rawContent = await textRes.text();
          }
        } catch (err) {
          return NextResponse.json({ error: "Không thể đọc nội dung từ bài báo này." }, { status: 400 });
        }
      }
    } else {
      // LUỒNG B: Xử lý Text trực tiếp
      sourceType = "direct_text";
      rawContent = url;
    }

    if (!rawContent) {
      return NextResponse.json({ error: "Nội dung rỗng." }, { status: 400 });
    }

    // 2. Phân tích qua Tự Minh (Gemini 1.5 Pro)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-pro", 
      systemInstruction: ANALYZE_SYSTEM_PROMPT,
    });

    let result;
    if (isAudioFlow) {
      // Gemini Audio Flow: Lắng nghe linh hồn âm thanh
      const prompt = userPrompt || "Hãy lắng nghe linh hồn âm thanh của video này, bóc tách toàn bộ ca từ, lời thoại và ý niệm để chuyển thành văn bản cho Hùng Đại";
      result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "audio/mp4",
            data: rawContent
          }
        }
      ]);
    } else {
      // Text Flow
      let finalPrompt = `
Nội dung (Source: ${sourceType}):
${rawContent}

Ý niệm của người sáng lập (User Prompt):
${userPrompt || "Hãy bóc tách tinh hoa tri thức và chuyển hóa thành bài luận báo chí xuất sắc."}

Yêu cầu: Hãy đóng vai một chuyên gia phân tích và nghệ sĩ tài ba, biến nội dung này thành một bài luận báo chí sắc sảo, mạch lạc và giàu tính triết lý.
`;

      if (sourceType === "longevity_article") {
        finalPrompt = `
Nội dung (Link Trường Thọ):
${rawContent}

Yêu cầu từ Hùng Đại:
Hãy bóc tách các bí quyết trường thọ từ bài báo này và viết lại thành một bài luận ngắn theo phong cách triết học cho Hùng Đại.
`;
      } else if (sourceType === "direct_text") {
        finalPrompt = `
Ý niệm trực tiếp từ Hùng Đại:
${rawContent}

Yêu cầu: Hãy bóc tách và phân tích ý niệm này thật sâu sắc dưới góc độ triết học và nghệ thuật. Chuyển hóa nó thành một bài luận báo chí sắc sảo.
`;
      }

      result = await model.generateContent(finalPrompt);
    }

    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ 
      result: text, 
      transcription: isAudioFlow ? text : rawContent.substring(0, 500) + "...",
      type: sourceType,
      isAudio: isAudioFlow
    });

  } catch (error: any) {
    console.error("Analyze API Error:", error);
    return NextResponse.json({ error: "Hệ thống bóc tách gặp sự cố.", details: error.message }, { status: 500 });
  }
}
