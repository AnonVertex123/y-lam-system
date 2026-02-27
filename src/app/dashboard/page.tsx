"use client"; 
import {  
  Search, Boxes, Globe, History, ChevronLeft, ChevronRight, Moon, Sun,  
  Link2, Sparkles, Youtube, FileText, ClipboardCopy, Share2, FileCode, Zap, Layers 
} from 'lucide-react'; 
import { useState } from 'react'; 
 
export default function YLamHeritage() { 
  const [l, setL] = useState(false); const [r, setR] = useState(false); 
  const [isDark, setIsDark] = useState(true); 
  const [isRevealed, setIsRevealed] = useState(false); 
  const [videoUrl, setVideoUrl] = useState(""); 
 
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
 
  return ( 
    <div className={`flex h-screen ${s.bg} transition-all duration-1000 font-sans overflow-hidden`}> 
      <button onClick={() => setIsDark(!isDark)} className="fixed top-6 right-20 z-[60] p-2 border rounded-full bg-zinc-900/10 hover:bg-zinc-900/50 transition-all shadow-sm"> 
        {isDark ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-orange-400" />} 
      </button> 
 
      <main className="flex-1 flex flex-col items-center pt-8 px-8 relative overflow-y-auto no-scrollbar"> 
         
        {/* KHU VỰC NHẬP LIỆU (TOP) */} 
        <div className="w-full max-w-3xl space-y-4 mb-8"> 
          <h1 className={`text-2xl font-light tracking-[0.8em] ${s.title} uppercase text-center transition-all duration-700`}>Ý LÂM</h1> 
          <div className={`${s.card} border rounded-[32px] p-6 shadow-2xl transition-all duration-1000`}> 
            <textarea className={`w-full bg-transparent outline-none ${s.input} h-16 resize-none text-lg transition-all duration-700`} placeholder="Ý tưởng kịch bản..." /> 
            <div className={`flex items-center gap-3 mt-3 p-3 bg-zinc-900/10 border border-zinc-900/50 rounded-full focus-within:border-zinc-700 transition-all duration-700`}> 
                <Link2 size={16} className="text-zinc-700"/> 
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={`flex-1 bg-transparent outline-none text-sm ${isDark ? 'text-zinc-400' : 'text-zinc-600'} transition-all duration-700`} placeholder="Dán link YouTube tại đây..." /> 
            </div> 
            <div className="flex justify-end items-center gap-3 pt-4 mt-3 border-t border-zinc-900/10"> 
              <button onClick={() => setIsRevealed(!isRevealed)} className={`px-6 py-2.5 ${s.btnSub} border font-bold rounded-full text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all hover:text-white`}><FileText size={14} /> Content</button> 
              <button className={`px-10 py-2.5 ${s.btn} font-bold rounded-full text-[10px] uppercase tracking-widest shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all`}><Sparkles size={14} /> Khai Phóng</button> 
            </div> 
          </div> 
        </div> 
 
        {/* KHU VỰC VIDEO & TỔNG QUAN (STAGE) */} 
        <div className="w-full max-w-4xl space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-1000"> 
           
          {/* VIDEO PLAYER */} 
          <div className="w-full aspect-video rounded-[32px] overflow-hidden border border-zinc-800 bg-black shadow-2xl transition-all duration-700"> 
            {videoId ? ( 
              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${videoId}`} title="Video Player" frameBorder="0" allowFullScreen></iframe> 
            ) : ( 
              <div className="w-full h-full flex items-center justify-center text-zinc-800 flex-col gap-2"> 
                <Youtube size={48} className="animate-pulse" /> 
                <span className="text-[10px] uppercase tracking-[0.3em]">Mạch dẫn video sẵn sàng</span> 
              </div> 
            )} 
          </div> 
 
          {/* KHUNG TỔNG QUAN CHI TIẾT (SCROLLABLE AREA) */} 
          <div className={`${s.card} border rounded-[40px] p-10 space-y-10 shadow-xl transition-all duration-1000`}> 
             
            {/* 1. Tóm tắt nội dung */} 
            <section className="space-y-4"> 
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3"> 
                  <Zap size={14} className="text-amber-500"/> Tóm tắt phân tích 
               </h3> 
               <p className={`text-sm leading-relaxed italic ${isDark ? 'text-zinc-400' : 'text-zinc-600'} transition-all`}>Nội dung cốt lõi của video sẽ được Tự Minh bóc tách tại đây, giúp Hùng Đại nắm bắt nhanh mọi thông điệp quan trọng...</p> 
            </section> 
 
            {/* 2. Lập luận chiến lược */} 
            <section className="space-y-4"> 
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3"> 
                  <Layers size={14} className="text-blue-500"/> Lập luận chiến lược 
               </h3> 
               <div className="p-6 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl transition-all"> 
                  <p className={`text-sm leading-relaxed ${isDark ? 'text-zinc-400' : 'text-zinc-600'}`}>Dựa trên dữ liệu, chúng ta đưa ra các bước thực thi để tối ưu hóa chi phí và sức mạnh tiến hóa cho Đế chế...</p> 
               </div> 
            </section> 
 
            {/* 3. Kịch bản ý tưởng */} 
            <section className="space-y-4"> 
               <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.4em] flex items-center gap-3"> 
                  <FileCode size={14} className="text-purple-500"/> Kịch bản ý tưởng 
               </h3> 
               <div className={`p-6 bg-zinc-900/40 border border-zinc-800 rounded-3xl min-h-[200px] font-serif text-lg ${isDark ? 'text-zinc-300' : 'text-zinc-800'} transition-all`}> 
                  Đây là nơi kịch bản triệu đô được trình bày. Với độ dài lớn, người dùng có thể thoải mái cuộn (scroll) để đọc và thẩm thấu tinh hoa... 
               </div> 
            </section> 
 
            {/* 4. THANH CÔNG CỤ HÀNH ĐỘNG */}
            <div className="flex justify-center gap-6 pt-6 border-t border-zinc-900/10">
               <button className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                  <ClipboardCopy size={14} /> Sao chép di sản
               </button>
               <button className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white transition-all">
                  <Share2 size={14} /> Lan tỏa mạch dẫn
               </button>
            </div>
          </div> 
        </div> 
      </main> 
 
      {/* Sidebars (Hidden for Zen Heritage Focus) */}
      <button onClick={() => setL(!l)} className="fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-2 rounded-full z-50 animate-pulse text-zinc-400 hover:text-white transition-all">
        {l ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
      </button> 
      <button onClick={() => setR(!r)} className="fixed right-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-2 rounded-full z-50 animate-pulse text-zinc-400 hover:text-white transition-all">
        {r ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
      </button> 

      <aside className={`${l?'w-72 border-r':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden z-40 relative`}>
        <div className="p-8 w-72 space-y-10">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-zinc-800'}`} />
            <span className={`text-[11px] font-bold uppercase tracking-[0.3em] ${s.title}`}>Khai Phá</span>
          </div>
          <nav className="space-y-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            <div className="flex items-center gap-4 hover:text-white cursor-pointer transition-all"><Search size={18}/> Tìm kiếm thông minh</div>
            <div className="flex items-center gap-4 hover:text-white cursor-pointer transition-all"><Zap size={18}/> Xu hướng AI</div>
            <div className="flex items-center gap-4 hover:text-white cursor-pointer transition-all"><Boxes size={18}/> Mạch dẫn hệ thống</div>
          </nav>
        </div>
      </aside>

      <aside className={`${r?'w-80 border-l':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden z-40`}>
        <div className="p-8 w-80">
          <div className={`flex items-center gap-3 mb-10 font-bold uppercase text-[10px] tracking-widest ${s.title}`}>
            <History size={16}/> Lưu Trữ
          </div>
          <div className="space-y-4">
            <div className={`p-4 ${s.card} border rounded-2xl text-[11px] italic opacity-60 transition-all`}>
              Di sản gần nhất của Hùng Đại...
            </div>
          </div>
        </div>
      </aside>
    </div> 
  ); 
} 
