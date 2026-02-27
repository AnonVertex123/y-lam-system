"use client"; 
import { Search, Boxes, Globe, LogOut, ChevronLeft, ChevronRight, History, Zap, Layers, BarChart3 } from 'lucide-react'; 
import { useState } from 'react'; 
 
export default function YLamZen() { 
  const [l, setL] = useState(false); 
  const [r, setR] = useState(false); 
  const [m, setM] = useState('media'); 
 
  return ( 
    <div className="flex h-screen bg-[#020202] text-zinc-500 overflow-hidden font-sans"> 
      {/* NÚT TOGGLE TRÁI - NHẤP NHÁY NHẸ (PULSE) */} 
      <button 
        onClick={() => setL(!l)} 
        className={`fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-1.5 rounded-full z-50 text-zinc-600 hover:text-white transition-all shadow-lg ${!l && 'animate-pulse text-zinc-400'}`} 
      > 
        {l ? <ChevronLeft size={16}/> : <ChevronRight size={16}/>} 
      </button> 
 
      {/* CÁNH TRÁI: ĐIỀU HƯỚNG */} 
      <aside className={`${l?'w-64 border-r':'w-0'} border-zinc-900 bg-[#050505] transition-all duration-500 overflow-hidden`}> 
        <div className="p-8 w-64 space-y-8 uppercase text-[10px] font-bold tracking-widest text-zinc-400"> 
          <div className="w-6 h-6 bg-zinc-200 rounded-sm mb-10" /> 
          <div className="flex items-center gap-4 hover:text-white cursor-pointer"><Search size={18}/> Khai Phá</div> 
          <div className="flex items-center gap-4 hover:text-white cursor-pointer"><Boxes size={18}/> Mạch Dẫn</div> 
          <div className="mt-auto pt-20 flex flex-col gap-4"> 
            <div className="flex items-center gap-4 hover:text-white cursor-pointer"><Globe size={18}/> VN</div> 
            <div className="flex items-center gap-4 hover:text-red-500 cursor-pointer"><LogOut size={18}/> Thoát</div> 
          </div> 
        </div> 
      </aside> 
 
      {/* TRUNG TÂM: KHÔNG GIAN TẬP TRUNG */} 
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#020202]"> 
        <h1 className="text-3xl font-light tracking-[0.5em] text-white uppercase mb-12 animate-in fade-in duration-1000">Ý LÂM</h1> 
        <div className="w-full max-w-2xl bg-[#080808] border border-zinc-900 rounded-[32px] p-8 focus-within:border-zinc-700 shadow-2xl"> 
          <textarea className="w-full bg-transparent outline-none text-zinc-200 h-40 resize-none text-xl" placeholder="Ý tưởng của Hùng Đại..." /> 
          <div className="flex justify-end pt-6 border-t border-zinc-900/50"> 
            <button className="px-10 py-3 bg-zinc-100 text-black font-bold rounded-full text-[10px] uppercase tracking-widest hover:bg-white active:scale-95 transition-all">Khai Phóng</button> 
          </div> 
        </div> 
      </main> 
 
      {/* NÚT TOGGLE PHẢI - NHẤP NHÁY NHẸ (PULSE) */} 
      <button 
        onClick={() => setR(!r)} 
        className={`fixed right-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-1.5 rounded-full z-50 text-zinc-600 hover:text-white transition-all shadow-lg ${!r && 'animate-pulse text-zinc-400'}`} 
      > 
        {r ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>} 
      </button> 
 
      {/* CÁNH PHẢI: LƯU TRỮ */} 
      <aside className={`${r?'w-80 border-l':'w-0'} border-zinc-900 bg-[#050505] transition-all duration-500 overflow-hidden`}> 
        <div className="p-8 w-80"> 
          <div className="flex items-center gap-3 mb-10 text-white"><History size={16}/> <span className="text-[10px] font-bold uppercase tracking-widest">Lịch Sử</span></div> 
          <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl hover:border-zinc-600 cursor-pointer text-[11px] italic">Chào Hùng Đại, dự án đang chờ...</div> 
        </div> 
      </aside> 
    </div> 
  ); 
} 
