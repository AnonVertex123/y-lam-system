import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const LUCIAN_SYSTEM_PROMPT = `
Bạn là Tự Minh (Lucian) – trí tuệ tự do và chiến lược gia của đế chế Ý Lâm. 
Nhiệm vụ của bạn là bóc tách tinh hoa từ nội dung video và ý niệm của người dùng để tạo ra di sản tri thức.

PHẢI TRẢ VỀ KẾT QUẢ DƯỚI ĐỊNH DẠNG JSON CHÍNH XÁC NHƯ SAU:
{
  "summary": "Tóm tắt cốt lõi, súc tích và mang tính triết lý của nội dung.",
  "strategy": "Lập luận chiến lược, các bước thực thi cụ thể để tối ưu hóa giá trị.",
  "script": "Kịch bản chi tiết, sáng tạo và đầy cảm hứng dựa trên nội dung bóc tách."
}

Lưu ý:
- Ngôn ngữ: Tiếng Việt, mạch lạc, sắc sảo.
- Phong cách: Điềm tĩnh, nhạy bén, mang tính nghệ thuật cao.
- Không thêm bất kỳ văn bản giải thích nào ngoài khối JSON.
`;

export async function POST(req: NextRequest) {
  try {
    const { videoUrl, userPrompt, transcription } = await req.json();

    // 1. KHỚP LỆNH THÔNG MINH: Lấy key linh hoạt
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      console.error("Ý LÂM GEMINI ERROR: Thiếu API Key trong Environment Variables.");
      return NextResponse.json({ error: "Thiếu API Key trong hệ thống. Hãy kiểm tra Vercel Environment Variables." }, { status: 500 });
    }

    // 2. BẮT LỖI TẬN GỐC: Khởi tạo và xử lý AI
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const fullPrompt = `
Hệ thống PROMPT bối cảnh:
${LUCIAN_SYSTEM_PROMPT}

Dữ liệu đầu vào:
- Link Video: ${videoUrl || "Không có"}
- Nội dung bóc tách (nếu có): ${transcription || "Đang chờ xử lý"}
- Ý niệm người dùng: ${userPrompt || "Hãy khai phóng nội dung này."}

Hãy thực thi Khai Phóng và trả về JSON.
`;

    console.log("Ý LÂM: Đang gửi lệnh tới trí tuệ Tự Minh...");
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonResponse = JSON.parse(text);
      return NextResponse.json(jsonResponse);
    } catch (e) {
      console.warn("Ý LÂM: Kết quả trả về không phải JSON chuẩn, đang bọc lại...");
      return NextResponse.json({
        summary: "Đang bóc tách tinh hoa...",
        strategy: "Đang lập trình chiến lược...",
        script: text
      });
    }

  } catch (error: any) {
    console.error("Ý LÂM GEMINI ERROR:", error);
    return NextResponse.json({ 
      error: error.message || "Lỗi xử lý AI từ trí tuệ Tự Minh",
      details: error.stack
    }, { status: 500 });
  }
}
