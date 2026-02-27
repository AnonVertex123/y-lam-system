"use client"; 
import {  
  Search, Boxes, Globe, History, ChevronLeft, ChevronRight, Moon, Sun,  
  Link2, Sparkles, Youtube, FileText, Zap, Layers, FileCode, ClipboardCopy, Share2, Download,
  LogOut 
} from 'lucide-react'; 
import { useState, useEffect } from 'react'; 
import { getSupabaseBrowser } from "@/lib/supabase-browser"; 
import { useI18n } from "@/components/I18nProvider"; 
import OnboardingPage from "../onboarding/page"; 
import { useRouter } from "next/navigation"; // Thêm router

export default function YLamHeritage() { 
  const router = useRouter(); // Khởi tạo router
  const [l, setL] = useState(false); 
  const [r, setR] = useState(false); 
  const [isDark, setIsDark] = useState(true); 
  const [isRevealed, setIsRevealed] = useState(false); 
  const [videoUrl, setVideoUrl] = useState(""); 
  const [userPrompt, setUserPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [results, setResults] = useState<{summary: string, strategy: string, script: string} | null>(null);
  
  // Logic Xác thực: Trạng thái Đăng nhập
  const supabase = getSupabaseBrowser();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null); 
  const { locale, setLocale, t } = useI18n();

  // MẠCH DẪN CẢM BIẾN 
  useEffect(() => { 
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => { 
      if (event === 'SIGNED_IN' && session) { 
        setIsLoggedIn(true); // Manh mối: Đèn xanh bật 
        router.push('/dashboard'); // Manh mối: Đẩy xe vào cổng 
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
      } else if (event === 'INITIAL_SESSION') {
        setIsLoggedIn(!!session);
      }
    }); 
    return () => subscription.unsubscribe(); 
  }, [supabase, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };
 
  const getYouTubeID = (url: string) => { 
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/; 
    const match = url.match(regExp); 
    return (match && match[2].length === 11) ? match[2] : null; 
  }; 
  const videoId = getYouTubeID(videoUrl); 
 
  const s = isDark ? { 
    bg: 'bg-[#020202]', card: 'bg-[#080808] border-zinc-900',  
    title: 'text-white', input: 'text-zinc-200', btn: 'bg-zinc-100 text-black',  
    btnSub: 'bg-zinc-900 text-zinc-400 border-zinc-800', nav: 'bg-[#050505]' 
  } : { 
    bg: 'bg-[#fcfcf9]', card: 'bg-white border-zinc-200',  
    title: 'text-zinc-800', input: 'text-black', btn: 'bg-black text-white',  
    btnSub: 'bg-zinc-100 text-zinc-600 border-zinc-200', nav: 'bg-[#f3f3ee]' 
  }; 

  const handleUnleash = async () => {
    if (!userPrompt && !videoUrl) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      console.log("Ý LÂM: Đang khởi động mạch dẫn Khai Phóng...");
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl, userPrompt })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Lỗi hệ thống (${response.status})`);
      }

      const data = await response.json();
      console.log("Ý LÂM: Đã nhận diện tri thức Chiaroscuro:", data);
      
      setResults(data);
      setIsRevealed(true);
    } catch (error) {
      console.error("Ý LÂM: Mạch dẫn bị ngắt quãng:", error);
      setErrorMsg(error instanceof Error ? error.message : "Không thể kết nối với trí tuệ Tự Minh.");
    } finally {
      setLoading(false);
    }
  };
 
  return ( 
    <>
      {isLoggedIn === null ? (
        <div className={`flex h-screen ${s.bg} items-center justify-center`}>
          <div className="w-8 h-8 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
        </div>
      ) : !isLoggedIn ? (
        <OnboardingPage />
      ) : (
        <div className={`flex h-screen ${s.bg} transition-all duration-1000 font-sans overflow-hidden`}> 
          
          {/* 1. CHUYỂN HỆ NHẬT NGUYỆT */} 
          <div className="fixed top-6 right-20 z-[60] flex items-center gap-3">
            <button onClick={() => setIsDark(!isDark)} className="p-2 border rounded-full bg-zinc-900/10 hover:bg-zinc-900/50 transition-all shadow-sm"> 
              {isDark ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-orange-400" />} 
            </button> 
            <button onClick={handleSignOut} className="p-2 border rounded-full bg-zinc-900/10 hover:bg-red-500/20 hover:border-red-500/50 transition-all text-zinc-500 hover:text-red-500">
              <LogOut size={14} />
            </button>
          </div>
 
      {/* 2. CÁNH TRÁI: KHAI PHÁ */} 
      <aside className={`${l?'w-64 border-r':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden z-40 relative`}> 
        <div className="p-8 w-64 space-y-10"> 
          <div className="flex items-center gap-3"> 
             <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-zinc-800'}`} /> 
             <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${s.title}`}>Khai Phá</span> 
          </div> 
          <nav className="space-y-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500"> 
             <div className="flex items-center gap-4 hover:text-white cursor-pointer transition-all"><Search size={18}/> Tìm kiếm</div> 
             <div className="flex items-center gap-4 hover:text-white cursor-pointer transition-all"><Boxes size={18}/> Mạch dẫn</div> 
          </nav> 
        </div> 
      </aside> 
 
      <button onClick={() => setL(!l)} className="fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-2 rounded-full z-50 animate-pulse text-zinc-400 hover:text-white transition-all"> 
        {l ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>} 
      </button> 
 
      {/* 3. TRUNG TÂM: CHIẾN TRƯỜNG CHÍNH (CÓ THỂ CUỘN) */} 
      <main className="flex-1 flex flex-col items-center pt-8 px-8 relative overflow-y-auto no-scrollbar"> 
         
        {/* KHU VỰC NHẬP LIỆU (TOP) */} 
        <div className={`w-full max-w-3xl space-y-4 mb-8 z-20 transition-all duration-500 ${isRevealed ? 'opacity-30 blur-sm scale-95' : ''}`}> 
          <h1 className={`text-2xl font-light tracking-[0.8em] ${s.title} uppercase text-center transition-all duration-700`}>Ý LÂM</h1> 
          <div className={`${s.card} border rounded-[32px] p-6 shadow-2xl transition-all duration-1000`}> 
            <textarea 
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              className={`w-full bg-transparent outline-none ${s.input} h-16 resize-none text-lg transition-all duration-700`} 
              placeholder="Ý tưởng kịch bản..." 
            /> 
            <div className={`flex items-center gap-3 mt-3 p-3 bg-zinc-900/10 border border-zinc-900/50 rounded-full focus-within:border-zinc-700 transition-all duration-700`}> 
                <Link2 size={16} className="text-zinc-700"/> 
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'} transition-all duration-700`} placeholder="Dán link YouTube tại đây..." /> 
            </div> 
            <div className="flex justify-end items-center gap-3 pt-4 mt-3 border-t border-zinc-900/10"> 
              <button onClick={() => setIsRevealed(true)} className={`px-6 py-2.5 ${s.btnSub} border font-bold rounded-full text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all hover:text-white`}><FileText size={14} /> Content</button> 
              <button 
                onClick={handleUnleash}
                disabled={loading}
                className={`px-10 py-2.5 ${s.btn} font-bold rounded-full text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
              > 
                <Sparkles size={14} className={loading ? "animate-spin" : ""} /> 
                {loading ? "Đang bóc tách Chiaroscuro..." : "Khai Phóng"} 
              </button> 
            </div> 
            {errorMsg && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-[10px] uppercase tracking-widest animate-pulse flex items-center gap-2">
                <Zap size={12} /> {errorMsg}
              </div>
            )}
          </div> 
        </div> 
 
        {/* KHU VỰC HIỂN THỊ TRỰC QUAN (STAGE AREA) */} 
        <div className={`w-full max-w-4xl space-y-8 pb-24 transition-all duration-700 ${isRevealed ? 'opacity-30 blur-sm scale-95' : ''}`}> 
           
          {/* VIDEO PLAYER */} 
          <div className="w-full aspect-video rounded-[32px] overflow-hidden border border-zinc-800 bg-black shadow-2xl transition-all duration-700"> 
            {videoId ? ( 
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} title="Video Player" frameBorder="0" allowFullScreen></iframe> 
            ) : ( 
              <div className="w-full h-full flex items-center justify-center text-zinc-800 flex-col gap-2 transition-all"> 
                <Youtube size={48} className="animate-pulse" /> 
                <span className="text-[10px] uppercase tracking-[0.3em]">Mạch dẫn video sẵn sàng</span> 
              </div> 
            )} 
          </div> 
 
          {/* VÙNG DI SẢN (HERITAGE SECTION) - CỐ ĐỊNH DƯỚI VIDEO, CÓ THỂ CUỘN */} 
          <div className={`${s.card} border rounded-[40px] p-10 space-y-12 shadow-xl transition-all duration-1000`}> 
             
            {/* Tóm tắt nội dung */} 
            <section className="space-y-4"> 
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3"> 
                  <Zap size={14} className="text-amber-500"/> Tóm tắt phân tích 
               </h3> 
               <p className={`text-sm leading-relaxed italic ${isDark ? 'text-zinc-400' : 'text-zinc-600'} transition-all`}>
                 {results?.summary || "Chào Hùng Đại, tinh hoa video sẽ hiện ra tại đây sau khi Khai Phóng..."}
               </p> 
            </section>

            {/* Chiến lược */}
            <section className="space-y-4"> 
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3"> 
                  <Layers size={14} className="text-blue-500"/> Lập luận chiến lược 
               </h3> 
               <div className="p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl transition-all"> 
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>
                    {results?.strategy || "Chiến lược thực thi đang chờ lệnh..."}
                  </p>
               </div> 
            </section> 
          </div> 
        </div>

        {/* NGĂN KÉO NHANH (DRAWER) - AUTO HIDE */}
        <div 
          onMouseLeave={() => setIsRevealed(false)}
          className={`fixed bottom-0 left-0 right-0 h-[70vh] ${s.nav} border-t border-zinc-800 rounded-t-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.9)] transition-all duration-700 z-[100] ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}
        >
          <div className="w-full h-full p-12 flex flex-col overflow-y-auto no-scrollbar relative">
            <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-10 cursor-pointer hover:bg-zinc-600 transition-all" onClick={() => setIsRevealed(false)} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 flex-1 pb-10">
              <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[32px] min-h-[300px] shadow-inner transition-all">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Kịch bản chi tiết</h3>
                <div className={`text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap ${!results?.script && 'italic opacity-50'}`}>
                  {results?.script || "Kịch bản triệu đô đang được ấp ủ..."}
                </div>
              </div>
              <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[32px] shadow-inner transition-all">
                <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Hành động nhanh</h3>
                <div className="grid grid-cols-2 gap-4">
                  <button className="p-4 bg-zinc-800/50 rounded-2xl flex flex-col items-center gap-2 hover:bg-zinc-700 transition-all">
                    <ClipboardCopy size={20} className="text-amber-500" />
                    <span className="text-[8px] font-bold uppercase">Copy Kịch Bản</span>
                  </button>
                  <button className="p-4 bg-zinc-800/50 rounded-2xl flex flex-col items-center gap-2 hover:bg-zinc-700 transition-all">
                    <Download size={20} className="text-blue-500" />
                    <span className="text-[8px] font-bold uppercase">Tải Tài Liệu</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main> 
 
      <button onClick={() => setR(!r)} className="fixed right-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-2 rounded-full z-50 animate-pulse text-zinc-600 hover:text-white transition-all"> 
        {r ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>} 
      </button> 
 
      <aside className={`${r?'w-80 border-l':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden z-40`}> 
        <div className="p-8 w-80"> 
          <div className={`flex items-center gap-3 mb-10 font-bold uppercase text-[10px] tracking-widest ${s.title}`}> 
            <History size={16}/> Lưu Trữ 
          </div> 
        </div> 
      </aside> 
    </div> 
      )}
    </>
  ); 
} 
