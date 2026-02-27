export const useTranscription = () => { 
  const runTranscription = async (url: string) => { 
    const keys = { 
      assembly: localStorage.getItem('ASSEMBLY_KEY'), 
      deepgram: localStorage.getItem('DEEPGRAM_KEY') 
    }; 

    // Lấy anchors từ localStorage để bảo tồn bản sắc
    const userDefinedAnchors = JSON.parse(localStorage.getItem('USER_ANCHORS') || '[]');

    const response = await fetch('/api/youtube', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        videoUrl: url, 
        userKeys: keys, // Đổi từ keys sang userKeys để đồng bộ với API "An Định"
        userDefinedAnchors
      }) 
    }); 

    return await response.json(); 
  }; 

  return { runTranscription }; 
};
