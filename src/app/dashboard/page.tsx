"use client"; 
import { Search, Boxes, Globe, LogOut, History, Zap, Layers, BarChart3, ChevronLeft, ChevronRight, Moon, Sun } from 'lucide-react'; 
import { useState } from 'react'; 
 
export default function YLamDayNight() { 
  const [l, setL] = useState(false); 
  const [r, setR] = useState(false); 
  const [isDark, setIsDark] = useState(true); // Mặc định là Ban Đêm (Zen) 
 
  // TÂM PHÁP MÀU SẮC: Sáng (Pixel) vs Tối (Zen) 
  const s = isDark ? { 
    bg: 'bg-[#020202]', card: 'bg-[#080808] border-zinc-900', 
    text: 'text-zinc-500', title: 'text-white', input: 'text-zinc-200', 
    btn: 'bg-zinc-100 text-black', nav: 'bg-[#050505]' 
  } : { 
    bg: 'bg-[#fcfcf9]', card: 'bg-white border-zinc-200', 
    text: 'text-zinc-500', title: 'text-zinc-800', input: 'text-black', 
    btn: 'bg-black text-white', nav: 'bg-[#f3f3ee]' 
  }; 
 
  return ( 
    <div className={`flex h-screen ${s.bg} ${s.text} transition-all duration-1000 font-sans overflow-hidden`}> 
      
      {/* NÚT CHUYỂN ĐỔI NHẬT - NGUYỆT */} 
      <button 
        onClick={() => setIsDark(!isDark)} 
        className={`fixed top-6 right-20 z-[60] flex items-center gap-3 px-5 py-2 border rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${isDark ? 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-zinc-200 text-zinc-600 shadow-sm'}`} 
      > 
        {isDark ? <Moon size={14} className="text-amber-500" /> : <Sun size={14} className="text-orange-400" />} 
        <span>{isDark ? 'Hệ Ban Đêm' : 'Hệ Ban Ngày'}</span> 
      </button> 
 
      {/* CÁNH TRÁI - TOGGLE PULSE */} 
      <button onClick={() => setL(!l)} className={`fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-900/10 p-2 rounded-full z-50 hover:bg-zinc-900/50 transition-all ${!l && 'animate-pulse'}`}> 
        {l ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>} 
      </button> 
 
      <aside className={`${l?'w-64 border-r':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden`}> 
        <div className="p-8 w-64 space-y-10"> 
          <div className={`w-8 h-8 rounded-lg shadow-lg ${isDark ? 'bg-amber-500' : 'bg-zinc-800'}`} /> 
          <nav className="space-y-6 text-[10px] font-bold uppercase tracking-[0.2em]"> 
             <div className="flex items-center gap-4 hover:opacity-100 opacity-60 cursor-pointer"><Search size={18}/> Khai Phá</div> 
             <div className="flex items-center gap-4 hover:opacity-100 opacity-60 cursor-pointer"><Boxes size={18}/> Mạch Dẫn</div> 
          </nav> 
        </div> 
      </aside> 
 
      {/* TRUNG TÂM - KHÔNG GIAN KHAI PHÓNG */} 
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative"> 
        <h1 className={`text-4xl font-light tracking-[0.6em] ${s.title} uppercase mb-12 transition-all`}>Ý LÂM</h1> 
        
        <div className={`w-full max-w-2xl ${s.card} border rounded-[40px] p-10 shadow-2xl transition-all duration-1000`}> 
          <textarea 
            className={`w-full bg-transparent outline-none ${s.input} h-40 resize-none text-xl placeholder-zinc-300`} 
            placeholder={isDark ? "Sáng tạo trong bóng đêm..." : "Lập kế hoạch trong ánh sáng..."} 
          /> 
          <div className="flex justify-end pt-6 border-t border-zinc-900/10"> 
            <button className={`px-12 py-3 ${s.btn} font-bold rounded-full text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-md`}> 
              Khai Phóng 
            </button> 
          </div> 
        </div> 
      </main> 
 
      {/* CÁNH PHẢI - TOGGLE PULSE */} 
      <button onClick={() => setR(!r)} className={`fixed right-4 top-1/2 -translate-y-1/2 bg-zinc-900/10 p-2 rounded-full z-50 hover:bg-zinc-900/50 transition-all ${!r && 'animate-pulse'}`}> 
        {r ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>} 
      </button> 
 
      <aside className={`${r?'w-80 border-l':'w-0'} ${s.nav} border-zinc-900 transition-all duration-500 overflow-hidden`}> 
        <div className="p-8 w-80"> 
          <div className={`flex items-center gap-3 mb-10 font-bold uppercase text-[10px] tracking-widest ${s.title}`}><History size={16}/> Lưu Trữ</div> 
          <div className={`p-5 ${s.card} border rounded-3xl text-[11px] italic opacity-60`}> 
             Nội dung gần nhất của Hùng Đại... 
          </div> 
        </div> 
      </aside> 
 
    </div> 
  ); 
} 
