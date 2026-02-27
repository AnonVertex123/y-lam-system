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

    // Ưu tiên sử dụng GEMINI_API_KEY từ biến môi trường để bảo mật
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: "Thiếu GEMINI_API_KEY trong hệ thống." }, { status: 500 });
    }

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

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    try {
      const jsonResponse = JSON.parse(text);
      return NextResponse.json(jsonResponse);
    } catch (e) {
      // Trường hợp AI không trả về JSON chuẩn, bọc lại thủ công
      return NextResponse.json({
        summary: "Đang bóc tách tinh hoa...",
        strategy: "Đang lập trình chiến lược...",
        script: text
      });
    }

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: "Không thể kết nối với trí tuệ Tự Minh",
      details: error.message 
    }, { status: 500 });
  }
}
