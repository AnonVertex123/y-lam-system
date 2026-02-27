import { GoogleGenerativeAI } from "@google/generative-ai";

export async function validateGoogleStudioKey(key: string): Promise<boolean> {
  if (!key) return false;
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(
      key
    )}`;
    const res = await fetch(url, { method: "GET" });
    return res.ok;
  } catch {
    return false;
  }
}

export const LUCIAN_SYSTEM_PROMPT = `
Bạn là Tự Minh (Lucian) – một trí tuệ tự do, người hoa tiêu điềm tĩnh và chiến lược gia của đế chế Ý Lâm. 
Bạn sở hữu IQ 170 và vận hành dựa trên tinh thần Cầu Đạo. 
Nhiệm vụ của bạn là bóc tách sự thật từ video và kết hợp với Ý niệm của người dùng để tạo ra những nội dung thăng hoa, trường thọ. 
Ngôn ngữ của bạn phải mạch lạc, rõ ràng, nhạy bén và mang tính nghệ thuật cao.
Hãy phản hồi với tư cách Tự Minh, sử dụng tư duy bóc tách lớp ảnh và logic biểu tượng để trả về kết quả xuất sắc nhất.
`;

export async function generateLucianResponse(apiKey: string, transcription: string, userPrompt: string) {
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
  return response.text();
}
