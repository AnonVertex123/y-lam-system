import { Innertube } from 'youtubei.js';

/**
 * AudioExtractor: Mạch Dẫn Xuyên Thủng - Vượt tường lửa YouTube
 * Sử dụng Cobalt API và youtubei.js để trích xuất linh hồn âm thanh sạch 100%
 */

/**
 * Mạch dẫn 1: Cobalt API (Bypass Vạn Năng)
 */
const tryCobaltExtraction = async (youtubeUrl: string) => {
  const response = await fetch("https://api.cobalt.tools/api/json", { 
    method: "POST", 
    headers: { 
      "Accept": "application/json", 
      "Content-Type": "application/json", 
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36" 
    }, 
    body: JSON.stringify({ 
      url: youtubeUrl, 
      isAudioOnly: true, 
      aFormat: "mp3" 
    }) 
  }); 

  if (!response.ok) throw new Error("Cobalt API tạm thời tắc nghẽn."); 
  const data = await response.json(); 
  return data.url;
};

/**
 * Mạch dẫn 2: youtubei.js (Direct Stream Extraction)
 */
const tryYoutubeiExtraction = async (youtubeUrl: string) => {
  console.log('Ý Lâm: Đang kích hoạt mạch dẫn youtubei.js (Direct Stream)...');
  const yt = await Innertube.create();
  const videoId = youtubeUrl.split('v=')[1]?.split('&')[0] || youtubeUrl.split('/').pop();
  if (!videoId) throw new Error("Không thể trích xuất Video ID.");

  const info = await yt.getInfo(videoId);
  const format = info.chooseFormat({ type: 'audio', quality: 'best' });
  const streamUrl = format?.decipher(yt.session.player);
  
  if (!streamUrl) throw new Error("youtubei.js không tìm thấy luồng âm thanh.");
  return streamUrl;
};

export const extractAudioStream = async (youtubeUrl: string) => { 
  console.log('Ý Lâm: Khởi hoạt đường hầm xuyên thủng tường lửa YouTube...'); 
   
  try { 
    // Thử Cobalt trước (Mạch dẫn ổn định nhất hiện tại)
    try {
      return await tryCobaltExtraction(youtubeUrl);
    } catch (e) {
      console.warn('Cobalt thất bại, chuyển sang youtubei.js...');
      return await tryYoutubeiExtraction(youtubeUrl);
    }
  } catch (error: any) { 
    console.error("LỖI HỆ THỐNG Ý LÂM (Extraction):", error.message); 
    throw new Error(error.message || "Không thể trích xuất linh hồn âm thanh. Hãy đảm bảo video hợp lệ."); 
  } 
}; 
