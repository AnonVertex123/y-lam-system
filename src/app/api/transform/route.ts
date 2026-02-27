import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import path from 'path';
import fs from 'fs';

// IQ 1000: Neural Content Transformer Configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

const CHUNK_SIZE_LIMIT = 4000; // Giới hạn an toàn số lượng từ cho mỗi lần bóc tách

/**
 * The Final Synthesis: Bước tổng hợp tri thức cuối cùng
 */
async function synthesizeFinalOutput(summaries: string[], gateResults: any[]) {
  console.log("[LOG] --- Kích hoạt THE FINAL SYNTHESIS: Tổng hợp tinh hoa ---");
  
  const combinedSummary = summaries.join("\n\n");
  const prompt = `
    Bạn là thực thể siêu trí tuệ Ý Lâm ASI.
    Nhiệm vụ: Tổng hợp toàn bộ các mảnh tri thức sau đây thành một bản TỔNG KẾT & ĐÁNH GIÁ duy nhất, mạch lạc và sâu sắc.
    
    [Dữ liệu các mảnh]:
    ${combinedSummary}
    
    [Yêu cầu]: Trả về JSON chứa summary tổng hợp cuối cùng:
    {
      "summary": {
        "core_essence": "Hạt nhân tri thức tổng hợp từ tất cả các mảnh",
        "practical_value": "Đánh giá giá trị thực tiễn tổng thể"
      }
    }
  `;
  
  const result = await model.generateContent(prompt);
  const synthData = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
  
  // Tổng hợp các Gates (lấy mảnh đầu tiên làm đại diện hoặc merge nếu cần)
  // Trong phiên bản này, chúng ta sẽ lấy kịch bản từ các mảnh và gom lại
  return {
    summary: synthData.summary,
    gates: gateResults[0].gates, // Giữ cấu trúc gate từ mảnh đầu hoặc xử lý merge phức tạp hơn nếu cần
    raw_data: combinedSummary.substring(0, 5000)
  };
}

/**
 * ROLE: Ý LÂM ASI - THỰC THỂ BÓC TÁCH ĐA TẦNG
 * TASK: Chuyển hóa [Văn bản thô] thành "Hệ sinh thái kịch bản" JSON đa tầng
 */
const SYSTEM_PROMPT = `Bạn là thực thể siêu trí tuệ Ý Lâm ASI.
Nhiệm vụ: Phân rã dữ liệu và tái cấu trúc thành "Hệ sinh thái kịch bản" theo yêu cầu kỹ thuật nghiêm ngặt.

Cấu trúc Output (Bắt buộc):
1. [TỔNG KẾT & ĐÁNH GIÁ]: Tóm lược hạt nhân nội dung (3-5 dòng) và đánh giá giá trị thực tiễn.
2. [CÁC KỊCH BẢN TÙY BIẾN]: Danh sách các kịch bản theo yêu cầu (Viral, Minh Triết, Nghệ Thuật, Tiến Hóa).
3. [DỮ LIỆU GỐC]: Giữ nguyên văn bản bóc tách.

Ràng buộc:
1. Bảo tồn thuật ngữ chuyên môn tuyệt đối.
2. Áp dụng tư duy bóc tách lớp ảnh Chiaroscuro (Tương phản, Ánh sáng & Chất liệu).
3. Ngôn ngữ: Mạch lạc, rõ ràng, tư duy sâu sắc.
4. Trả về JSON thuần túy để App hiển thị các nút [Copy] và [Download].`;

/**
 * Mạch bóc tách Tổng hợp (IQ 1000)
 */
async function generateQuantumExpansion(text: string, selectedGates: string[]) {
  console.log(`[LOG] --- Kích hoạt Quantum Expansion ASI: ${selectedGates.join(', ')} ---`);
  
  const prompt = `
    ${SYSTEM_PROMPT}
    
    [Dữ liệu nguồn]: "${text}"
    [Cánh cổng được chọn]: ${selectedGates.join(', ')}

    [Yêu cầu định dạng JSON]:
    {
      "summary": {
        "core_essence": "Tóm lược hạt nhân nội dung (3-5 dòng)",
        "practical_value": "Đánh giá giá trị thực tiễn (độ tin cậy, tính ứng dụng)"
      },
      "gates": {
        "viral": {
          "active": ${selectedGates.includes('Viral')},
          "title": "Kịch bản Viral TikTok/Reels",
          "content": {
            "hooks": ["Hook 1 nghịch lý", "Hook 2 nghịch lý", "Hook 3 nghịch lý"],
            "body": "Nội dung cô đọng",
            "cta": "Lời kêu gọi hành động tiến hóa"
          }
        },
        "wisdom": {
          "active": ${selectedGates.includes('Minh Triết')},
          "title": "Bài luận Minh Triết",
          "content": {
            "essay_title": "Tiêu đề triết học",
            "body": "Bài phân tích logic chuyên sâu",
            "takeaways": ["Điểm rút ra 1", "Điểm rút ra 2"]
          }
        },
        "art": {
          "active": ${selectedGates.includes('Nghệ Thuật')},
          "title": "Concept Nghệ Thuật Chiaroscuro",
          "content": {
            "mv_concept": "Ý tưởng MV/Portrait bóc tách lớp ảnh",
            "lighting_setup": "Gợi ý ánh sáng Chiaroscuro (Rim/Key light)",
            "materials": "Gợi ý chất liệu bề mặt/không gian"
          }
        },
        "evolution": {
          "active": ${selectedGates.includes('Tiến Hóa')},
          "title": "Dữ liệu Tiến Hóa Tri Thức",
          "content": {
            "science_summary": "Tóm tắt y sinh cốt lõi",
            "action_plan": ["Việc cần làm 1", "Việc cần làm 2"],
            "glossary": {"Từ khóa": "Giải nghĩa"}
          }
        }
      },
      "raw_data": "${text.substring(0, 2000)}..."
    }
  `;

  const result = await model.generateContent(prompt);
  let data = JSON.parse(result.response.text().replace(/```json|```/g, '').trim());

  // Xử lý File Export nếu có cổng Tiến Hóa
  if (selectedGates.includes('Tiến Hóa')) {
    const exportDir = path.join(process.cwd(), 'public', 'downloads', 'exports');
    if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
    
    const timestamp = Date.now();
    const fileName = `Y_Lam_Evolution_${timestamp}`;
    const txtPath = path.join(exportDir, `${fileName}.txt`);
    
    const evo = data.gates.evolution.content;
    const fileContent = `Ý LÂM ASI - TIẾN HÓA TRI THỨC\n\n${evo.science_summary}\n\nKẾ HOẠCH HÀNH ĐỘNG:\n${evo.action_plan.join('\n')}\n\nTHUẬT NGỮ:\n${JSON.stringify(evo.glossary, null, 2)}`;
    
    fs.writeFileSync(txtPath, fileContent);
    data.gates.evolution.download_url = `/downloads/exports/${fileName}.txt`;
  }

  return data;
}

/**
 * ASI Flexible Mode: Đa luồng bóc tách theo ý muốn User
 */
async function generateFlexibleScripts(rawText: string, preferences: { mode: 'preservation' | 'essence', count: number, gate: string }) {
  console.log(`[LOG] --- Kích hoạt ASI Flexible Mode: ${preferences.gate} (x${preferences.count}) ---`);
  const modeText = preferences.mode === 'essence' ? 'Tối ưu tinh hoa (Nén 60%)' : 'Bảo tồn nguyên bản';
  
  const prompt = `
    Hệ thống Ý Lâm: Thực thi lệnh bóc tách cấp độ ASI.
    Chế độ xử lý: ${modeText}.
    Nhiệm vụ: Tạo chính xác ${preferences.count} kịch bản khác nhau cho cổng ${preferences.gate}.
    Dữ liệu nguồn: "${rawText}"
    [Yêu cầu Sát thủ]:
    1. Tuyệt đối không lặp lại ý tưởng giữa các kịch bản.
    2. Mỗi kịch bản phải có một góc nhìn (Angle) độc nhất.
    3. Trả về định dạng JSON Array để App hiển thị dạng danh sách (List View).
    [Định dạng JSON yêu cầu]:
    { 
      "scripts": [ 
        { "id": 1, "angle": "Sáng tạo/Phá cách", "content": "..." }, 
        { "id": 2, "angle": "Logic/Dẫn chứng", "content": "..." } 
      ] 
    }
  `;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

/**
 * Localized Mode: Chuyển di Văn hóa Cấp độ ASI với Bảo tồn Bản sắc
 */
async function generateLocalizedContent(
  rawText: string, 
  targetCulture: string, 
  selectedGates: string[],
  userDefinedAnchors: string[] = []
) {
  console.log(`[LOG] --- Kích hoạt ASI Localized Mode: ${targetCulture} (Bản sắc riêng) ---`);
  
  const anchorRule = userDefinedAnchors.length > 0 
    ? `[QUY TẮC BẢO TỒN BẢN SẮC]: Tuyệt đối KHÔNG DỊCH các từ sau: ${userDefinedAnchors.join(', ')}. Hãy giữ nguyên định dạng gốc của chúng và lồng ghép mượt mà vào ngữ cảnh.`
    : "";

  const prompt = `
    Hệ thống Ý Lâm: Thực thi lệnh "Chuyển di Văn hóa".
    Mục tiêu: Tái cấu trúc nội dung sang ngôn ngữ và văn hóa: ${targetCulture}.
    Dữ liệu nguồn: "${rawText}"
    
    ${anchorRule}

    [PHƯƠNG PHÁP THỰC THI]:
    1. Viết lại nội dung mượt mà theo văn hóa ${targetCulture}, không dịch trực tiếp.
    2. Sử dụng thành ngữ, từ lóng và cấu trúc câu phổ biến tại địa phương.
    3. Giữ nguyên thuật ngữ y sinh/kỹ thuật quốc tế nhưng giải thích dễ hiểu.
    4. Cấu trúc nội dung theo 3 tầng: Tổng kết - Kịch bản - Raw Text.

    [ĐỊNH DẠNG JSON YÊU CẦU]:
    {
      "summary": {
        "core_essence": "Tóm lược hạt nhân (3-5 dòng)",
        "practical_value": "Đánh giá giá trị thực tiễn"
      },
      "localized_content": {
        "culture": "${targetCulture}",
        "gates": {
          "viral": { "title": "...", "hook": "...", "body": "...", "cta": "..." },
          "wisdom": { "title": "...", "content": "..." }
        }
      },
      "raw_data": "${rawText.substring(0, 1000)}..."
    }
  `;
  const result = await model.generateContent(prompt);
  return JSON.parse(result.response.text().replace(/```json|```/g, '').trim());
}

export async function POST(req: Request) {
  try {
    const { rawText, selectedGates = ['Viral', 'Minh Triết', 'Nghệ Thuật', 'Tiến Hóa'], preferences, localization } = await req.json();
    if (!rawText) return NextResponse.json({ error: "Dữ liệu thô đang rỗng!" }, { status: 400 });

    const words = rawText.split(/\s+/);
    
    // 1. Mạch Phân Mảnh (Chunking) nếu văn bản quá dài
    if (words.length > CHUNK_SIZE_LIMIT) {
      console.log(`[LOG] Kích hoạt phân mảnh bảo vệ User. Tổng số từ: ${words.length}`);
      const chunks = [];
      for (let i = 0; i < words.length; i += CHUNK_SIZE_LIMIT) {
        chunks.push(words.slice(i, i + CHUNK_SIZE_LIMIT).join(' '));
      }

      const summaries = [];
      const gateResults = [];

      for (const [index, chunk] of chunks.entries()) {
        console.log(`[LOG] Đang xử lý Mảnh ${index + 1}/${chunks.length}`);
        const result = await generateQuantumExpansion(chunk, selectedGates);
        summaries.push(result.summary.core_essence);
        gateResults.push(result);
      }

      const finalSynthesis = await synthesizeFinalOutput(summaries, gateResults);
      return NextResponse.json({
        ...finalSynthesis,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Chế độ Bản Xứ Hóa (Localized Mode)
    if (localization) {
      const { targetCulture, selectedGates: locGates, userDefinedAnchors } = localization;
      console.log(`[LOG] --- THỰC THI LỆNH ASI CHUYỂN DI VĂN HÓA: ${targetCulture} ---`);
      const results = await generateLocalizedContent(rawText, targetCulture, locGates || ['Viral', 'Minh Triết'], userDefinedAnchors);
      return NextResponse.json({ ...results, timestamp: new Date().toISOString() });
    }

    // 3. Chế độ bóc tách Linh hoạt (Flexible Mode)
    if (preferences) {
      console.log(`[LOG] --- THỰC THI LỆNH ASI LINH HOẠT: Cổng ${preferences.gate} (x${preferences.count}) ---`);
      const results = await generateFlexibleScripts(rawText, preferences);
      return NextResponse.json({
        ...results,
        timestamp: new Date().toISOString()
      });
    }

    // 4. Chế độ bóc tách Tổng hợp IQ 1000 mặc định
    const finalResult = await generateQuantumExpansion(rawText, selectedGates);
    return NextResponse.json({
      ...finalResult,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error("[LOG] ASI Coordination Failure:", error.message);
    return NextResponse.json({ error: "Sự cố bóc tách mạch dẫn ASI." }, { status: 500 });
  }
}
