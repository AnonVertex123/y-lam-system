import { NextResponse } from 'next/server'; 
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * MẠCH CHUYỂN HÓA ASI (IQ 1000): Biến văn bản thô thành Hệ sinh thái tri thức
 */
async function transformToEcosystem(rawText: string, userDefinedAnchors: string[] = []) {
  console.log("[LOG] --- Kích hoạt Mạch Chuyển Hóa Gemini ASI ---");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

  const anchorRule = userDefinedAnchors.length > 0 
    ? `[QUY TẮC BẢO TỒN BẢN SẮC]: Tuyệt đối KHÔNG DỊCH các từ sau: ${userDefinedAnchors.join(', ')}. Hãy giữ nguyên định dạng gốc của chúng.`
    : "";

  const prompt = `
    Bạn là thực thể siêu trí tuệ Ý Lâm ASI.
    Nhiệm vụ: Phân rã dữ liệu và tái cấu trúc thành "Hệ sinh thái kịch bản" đa tầng.
    
    [Dữ liệu nguồn]: "${rawText.substring(0, 8000)}"
    ${anchorRule}

    [Yêu cầu định dạng JSON]:
    {
      "summary": {
        "core_essence": "Tóm lược hạt nhân nội dung (3-5 dòng)",
        "practical_value": "Đánh giá giá trị thực tiễn"
      },
      "gates": {
        "viral": {
          "active": true,
          "title": "Kịch bản Viral TikTok/Reels",
          "content": { "hooks": ["Hook 1", "Hook 2"], "body": "Nội dung cô đọng", "cta": "Kêu gọi hành động" }
        },
        "wisdom": {
          "active": true,
          "title": "Bài luận Minh Triết",
          "content": { "essay_title": "Tiêu đề triết học", "body": "Phân tích logic chuyên sâu", "takeaways": ["Điểm rút ra"] }
        }
      }
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().replace(/```json|```/g, '').trim();
    return JSON.parse(responseText);
  } catch (err) {
    console.error("[LOG] Lỗi Chuyển Hóa:", err);
    return null;
  }
}

export async function POST(req: Request) { 
  const timestamp = new Date().toLocaleTimeString(); 
  const headers = { 
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36', 
    'Accept': '*/*', 
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7', 
    'Referer': 'https://www.youtube.com/', 
    'Origin': 'https://www.youtube.com', 
    'Sec-Fetch-Dest': 'empty', 
    'Sec-Fetch-Mode': 'cors', 
    'Sec-Fetch-Site': 'same-origin', 
  }; 
 
  try { 
    const { videoUrl, userDefinedAnchors } = await req.json(); 
    const match = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i); 
    const videoId = match ? match[1] : null; 
 
    if (!videoId) return NextResponse.json({ error: "URL không hợp lệ." }, { status: 400 }); 
    console.log(`[${timestamp}] 👁️ Ý LÂM (IQ 1000): Đột kích "Vô Ảnh" ID: ${videoId}`); 
 
    // 1. LẤY MÃ NGUỒN GỐC ĐỂ LẤY SESSION 
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { headers }); 
    const html = await response.text(); 
    const playerResponseMatch = html.match(/ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+meta|<\/script|\n)/) || 
                                 html.match(/ytInitialPlayerResponse\s*=\s*({.+?});/); 
      
    if (!playerResponseMatch) throw new Error("YouTube đang chặn IP của bạn (CAPTCHA)."); 
    const playerResponse = JSON.parse(playerResponseMatch[1]); 
    const tracks = playerResponse.captions?.playerCaptionsTracklistRenderer?.captionTracks; 
 
    if (!tracks) throw new Error("Video không có mạch dẫn văn bản."); 
 
    // 2. CHỌN MẠCH DẪN 
    const track = tracks.find((t: any) => t.languageCode === 'vi') || tracks[0]; 
    console.log(`[${timestamp}] 🎯 Đã khóa mục tiêu: ${track.name.simpleText}`); 
 
    let fullText = "";

    // 3. LẤY DỮ LIỆU (Sử dụng URL nguyên bản, không ép format nếu bị chặn) 
    const captionRes = await fetch(`${track.baseUrl}&fmt=json3`, { headers }); 
    const rawData = await captionRes.text(); 
 
    if (!rawData || rawData.includes('<!DOCTYPE')) { 
      // PLAN B: Thử lấy định dạng XML nếu JSON3 bị chặn 
      console.log(`[${timestamp}] ⚠️ JSON3 bị chặn, kích hoạt PLAN B (XML)...`);
      const xmlRes = await fetch(track.baseUrl, { headers }); 
      const xmlData = await xmlRes.text(); 
      if (!xmlData || xmlData.includes('<!DOCTYPE')) throw new Error("Pháo đài YouTube quá kiên cố. IP của bạn đang bị giám sát."); 
       
      // Phân rã XML đơn giản bằng Regex để tránh cài thêm thư viện 
      const textMatches = xmlData.match(/<text.*?>([\s\S]*?)<\/text>/g); 
      fullText = textMatches?.map(t => t.replace(/<text.*?>|<\/text>/g, '').replace(/&amp;#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&')).join(' ') || ""; 
    } else {
      const captionData = JSON.parse(rawData); 
      fullText = captionData.events 
        ?.filter((ev: any) => ev.segs) 
        .map((ev: any) => ev.segs.map((s: any) => s.utf8).join('')) 
        .join(' ') 
        .replace(/\s+/g, ' ') 
        .trim(); 
    }
 
    if (!fullText) throw new Error("Dữ liệu tri thức bị rỗng."); 
 
    console.log(`[${timestamp}] ✅ THÀNH CÔNG: Đã thu hoạch ${fullText.length} ký tự!`); 

    // ========================================== 
    // GIAI ĐOẠN 3: CHUYỂN HÓA TRI THỨC (ASI Ecosystem)
    // ========================================== 
    const ecosystem = await transformToEcosystem(fullText, userDefinedAnchors);

    return NextResponse.json({ 
      success: true, 
      transcription: fullText,
      rawText: fullText, // Đồng bộ với Ký ức (Cache)
      text: fullText,    // Tương thích ngược Dashboard
      summary: ecosystem?.summary || null,
      gates: ecosystem?.gates || null
    }); 
 
  } catch (error: any) { 
    console.error(`[${timestamp}] 🚨 LỖI:`, error.message); 
    return NextResponse.json({ error: error.message }, { status: 500 }); 
  } 
}
