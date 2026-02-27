"use client"; 
import { Search, Boxes, Globe, LogOut, History, Zap, Layers, BarChart3, ChevronLeft, ChevronRight, Moon, Sun, Link2, Sparkles, Youtube, FileText } from 'lucide-react'; 
import { useState } from 'react'; 
 
export default function YLamControl() { 
  const [l, setL] = useState(false); const [r, setR] = useState(false); 
  const [isDark, setIsDark] = useState(true); 
  const [isRevealed, setIsRevealed] = useState(false); 
  const [videoUrl, setVideoUrl] = useState(""); 
 
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
      
      {/* CHUYỂN HỆ NHẬT NGUYỆT */} 
      <button onClick={() => setIsDark(!isDark)} className="fixed top-6 right-20 z-[60] p-2 border rounded-full bg-zinc-900/10 hover:bg-zinc-900/50 transition-all shadow-sm"> 
        {isDark ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-orange-400" />} 
      </button> 
 
      <main className="flex-1 flex flex-col items-center pt-10 px-8 relative overflow-hidden"> 
        
        {/* KHU VỰC ĐIỀU KHIỂN */} 
        <div className={`w-full max-w-3xl space-y-4 z-20 transition-all duration-700 ${isRevealed ? 'scale-95 opacity-40 blur-sm' : ''}`}> 
          <h1 className={`text-2xl font-light tracking-[0.8em] ${s.title} uppercase text-center transition-all duration-700`}>Ý LÂM</h1> 
          <div className={`${s.card} border rounded-[32px] p-6 shadow-2xl transition-all duration-1000`}> 
            <textarea className={`w-full bg-transparent outline-none ${s.input} h-16 resize-none text-lg placeholder-zinc-800 transition-all duration-700`} placeholder="Ý tưởng kịch bản..." /> 
            
            <div className={`flex items-center gap-3 mt-3 p-3 bg-zinc-900/10 border border-zinc-900/50 rounded-full focus-within:border-zinc-700 transition-all duration-700`}> 
                <Link2 size={16} className="text-zinc-700"/> 
                <input value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className={`flex-1 bg-transparent outline-none ${s.input} text-sm placeholder-zinc-800 transition-all duration-700`} placeholder="Dán link video..." /> 
            </div> 
 
            {/* BỘ ĐÔI NÚT BẤM CHIẾN LƯỢC */} 
            <div className="flex justify-end items-center gap-3 pt-4 mt-3 border-t border-zinc-900/10"> 
              {/* Nút Content - Chỉ để xem lại, không tạo mới */} 
              <button 
                onClick={() => setIsRevealed(true)} 
                className={`px-6 py-2.5 ${s.btnSub} border font-bold rounded-full text-[9px] uppercase tracking-widest hover:text-white hover:border-zinc-600 transition-all flex items-center gap-2`} 
              > 
                <FileText size={14} /> Content 
              </button> 
 
              {/* Nút Khai Phóng - Để tạo kịch bản mới */} 
              <button 
                onClick={() => setIsRevealed(true)} 
                className={`px-10 py-2.5 ${s.btn} font-bold rounded-full text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2`} 
              > 
                <Sparkles size={14} /> Khai Phóng 
              </button> 
            </div> 
          </div> 
 
          {/* HIỂN THỊ CLIP KHI CÓ LINK */} 
          {videoUrl && ( 
            <div className="w-full aspect-video rounded-[32px] overflow-hidden border border-zinc-800 bg-black shadow-2xl animate-in zoom-in duration-500 transition-all"> 
               <div className="w-full h-full flex items-center justify-center text-zinc-800 flex-col gap-2"> 
                  <Youtube size={48} className="text-red-500 animate-pulse" /> 
                  <span className="text-[10px] uppercase tracking-[0.3em] text-zinc-500">Mạch dẫn video sẵn sàng</span> 
               </div> 
            </div> 
          )} 
        </div> 
 
        {/* NGĂN KÉO TỰ ĐỘNG ẨN KHI RỜI CHUỘT */} 
        <div 
          onMouseLeave={() => setIsRevealed(false)} 
          className={`fixed bottom-0 left-0 right-0 h-[70vh] ${s.nav} border-t border-zinc-800 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] transition-all duration-700 z-[100] ${isRevealed ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`} 
        > 
            <div className="w-full h-full p-10 flex flex-col overflow-y-auto no-scrollbar relative"> 
                <div className="w-12 h-1 bg-zinc-800 rounded-full mx-auto mb-8 hover:bg-zinc-600 transition-all cursor-pointer" /> 
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1 pb-10"> 
                    <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[32px] min-h-[300px] shadow-inner transition-all"> 
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Dữ liệu đã xử lý</h3> 
                        <p className="text-zinc-300 text-sm italic leading-relaxed">Chào Hùng Đại, đây là kịch bản của bạn. Hãy hover ra ngoài để quay lại sửa bài nhé...</p> 
                    </div> 
                    <div className="p-8 bg-zinc-900/40 border border-zinc-800 rounded-[32px] shadow-inner transition-all"> 
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-zinc-800 pb-2">Phân tích chuyên sâu</h3> 
                        <div className="w-full h-32 bg-zinc-800/20 rounded-2xl animate-pulse mt-4"></div>
                        <div className="mt-6 space-y-3">
                          <div className="w-full h-2 bg-zinc-800/30 rounded-full"></div>
                          <div className="w-3/4 h-2 bg-zinc-800/30 rounded-full"></div>
                          <div className="w-1/2 h-2 bg-zinc-800/30 rounded-full"></div>
                        </div>
                    </div> 
                </div> 
            </div> 
        </div> 
      </main> 
 
      {/* HAI CÁNH SIDEBAR */} 
      <button onClick={() => setL(!l)} className="fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-2 rounded-full z-50 animate-pulse text-zinc-400 hover:text-white transition-all">
        {l ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>}
      </button> 
      <button onClick={() => setR(!r)} className="fixed right-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-2 rounded-full z-50 animate-pulse text-zinc-400 hover:text-white transition-all">
        {r ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
      </button> 

      {/* Sidebar Components (Hidden by default w-0) */}
      <aside className={`${l?'w-64 border-r':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden z-40`}>
        <div className="p-8 w-64 space-y-8">
          <div className={`w-8 h-8 rounded-lg ${isDark ? 'bg-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.3)]' : 'bg-zinc-800'}`} />
          <nav className="space-y-6 text-[10px] font-bold uppercase tracking-widest opacity-60">
            <div className="flex items-center gap-4 hover:opacity-100 cursor-pointer transition-all"><Search size={18}/> Khai Phá</div>
          </nav>
        </div>
      </aside>
      <aside className={`${r?'w-80 border-l':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden z-40`}>
        <div className="p-8 w-80">
          <div className={`flex items-center gap-3 mb-10 font-bold uppercase text-[10px] tracking-widest opacity-60 ${s.title}`}><History size={16}/> Lưu Trữ</div>
        </div>
      </aside>
 
    </div> 
  ); 
} 
