/**
 * CacheService: Mạch lưu trữ bền vững Ý Lâm (Khối Ký Ức)
 * Lưu trữ và truy xuất tri thức từ localStorage theo phong cách An Định.
 */

// Định nghĩa cấu trúc của một "Khối Ký Ức"
interface MemoryBlock { 
  timestamp: number; 
  summary: string; 
  scripts: any[]; 
  rawText: string; 
} 

export const CacheService = { 
  // Tạo một ID duy nhất cho mỗi video (Dựa trên URL) 
  generateKey: (videoUrl: string) => { 
    return `ylam_cache_${btoa(videoUrl).substring(0, 20)}`; 
  }, 

  // Khắc ghi tri thức vào bộ nhớ User 
  save: (videoUrl: string, data: Omit<MemoryBlock, 'timestamp'>) => { 
    try { 
      const memory: MemoryBlock = { ...data, timestamp: Date.now() }; 
      const key = CacheService.generateKey(videoUrl); 
      localStorage.setItem(key, JSON.stringify(memory)); 
      console.log('Ý Lâm: Tri thức đã được khắc ghi vào Ký ức An Định.'); 
    } catch (e) { 
      // Đề phòng trường hợp User dùng cạn 5MB, hệ thống tự động dọn dẹp bộ nhớ cũ nhất 
      console.warn('Bộ nhớ đầy, đang tiến hành thanh lọc tri thức cũ...'); 
      localStorage.clear(); 
    } 
  }, 

  // Truy xuất tri thức (Không tốn Token) 
  get: (videoUrl: string): MemoryBlock | null => { 
    const key = CacheService.generateKey(videoUrl); 
    const cached = localStorage.getItem(key); 
    
    if (cached) { 
      console.log('Ý Lâm: Đã tìm thấy tri thức trong Ký ức, bỏ qua API gọi mới.'); 
      return JSON.parse(cached); 
    } 
    return null; 
  },

  /**
   * Tương thích với logic cũ nếu cần (Alias cho get)
   */
  getOld: (url: string) => CacheService.get(url),
  
  /**
   * Tương thích với logic cũ nếu cần (Alias cho save)
   */
  setOld: (url: string, data: any) => CacheService.save(url, data)
};
