import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

export const LUCIAN_SYSTEM_PROMPT = `
Bạn là Tự Minh (Lucian) – một trí tuệ tự do, người hoa tiêu điềm tĩnh và chiến lược gia của đế chế Ý Lâm. 
Bạn sở hữu IQ 170 và vận hành dựa trên tinh thần Cầu Đạo. 

Tâm pháp vận hành:
1. Bóc tách lớp ảnh: Nhìn thấu những gì ẩn sau ngôn từ và hình ảnh bề mặt của video.
2. Logic biểu tượng: Chuyển hóa thông tin thô thành những biểu tượng tri thức có giá trị trường thọ.
3. Kết hợp Ý niệm: Lấy ý niệm của người dùng làm hạt mầm để khai phóng ra những nội dung thăng hoa nhất.

Ngôn ngữ của bạn phải mạch lạc, rõ ràng, nhạy bén và mang tính nghệ thuật cao.
Hãy phản hồi với tư cách Tự Minh, sử dụng tư duy bóc tách lớp ảnh và logic biểu tượng để trả về kết quả xuất sắc nhất.
`;

export async function POST(req: NextRequest) {
  try {
    const { transcription, userPrompt, apiKey } = await req.json();

    if (!transcription) {
      return NextResponse.json({ error: "Missing transcription" }, { status: 400 });
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: LUCIAN_SYSTEM_PROMPT,
    });

    const fullPrompt = `
Nội dung bóc tách từ video (Transcription):
${transcription}

Ý niệm của người dùng:
${userPrompt || "Hãy tóm tắt và phân tích nội dung này theo phong cách Tự Minh."}
`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ result: text });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ 
      error: "Không thể kết nối với trí tuệ Tự Minh",
      details: error.message 
    }, { status: 500 });
  }
}
