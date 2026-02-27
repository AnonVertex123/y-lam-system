"use client"; 
 
import { Search, Boxes, Globe, LogOut, ChevronLeft, ChevronRight, History, Zap, Layers, BarChart3 } from 'lucide-react'; 
import { useState } from 'react'; 
 
export default function YLamZen() { 
  // Trạng thái Mặc Định: Ẩn toàn bộ để tạo sự thông thoáng 
  const [l, setL] = useState(false); 
  const [r, setR] = useState(false); 
  const [m, setM] = useState('media'); 
 
  return ( 
    <div className="flex h-screen bg-[#020202] text-zinc-500 overflow-hidden font-sans"> 
      
      {/* CÁNH TRÁI: ĐIỀU HƯỚNG (ẨN) */} 
      <aside className={`${l?'w-64 border-r':'w-0'} border-zinc-900 bg-[#050505] transition-all duration-500 relative overflow-hidden`}> 
        <div className="p-6 w-64"> 
          <div className="w-6 h-6 bg-zinc-200 rounded-sm mb-10" /> 
          <nav className="space-y-6 text-[10px] font-bold uppercase tracking-widest"> 
             <div className="flex items-center gap-4 hover:text-white cursor-pointer"><Search size={18}/> Khai Phá</div> 
             <div className="flex items-center gap-4 hover:text-white cursor-pointer"><Boxes size={18}/> Mạch Dẫn</div> 
          </nav> 
        </div> 
      </aside> 
      
      {/* Nút Toggle Trái tinh tế */} 
      <button onClick={()=>setL(!l)} className="fixed left-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-1.5 rounded-full z-50 text-zinc-700 hover:text-white transition-all"> 
        {l ? <ChevronLeft size={14}/> : <ChevronRight size={14}/>} 
      </button> 
 
      {/* TRUNG TÂM: KHÔNG GIAN KHAI PHÓNG */} 
      <main className="flex-1 flex flex-col items-center justify-center p-8 bg-[#020202] relative"> 
        <div className="w-full max-w-2xl space-y-12 animate-in fade-in zoom-in duration-1000"> 
          <div className="flex justify-center gap-6 mb-4"> 
            {['media', 'visual', 'report'].map(id => ( 
              <button key={id} onClick={()=>setM(id)} className={`text-[9px] font-bold uppercase tracking-[0.3em] transition-all ${m === id ? 'text-white border-b border-white pb-1' : 'text-zinc-700 hover:text-zinc-400'}`}> 
                {id === 'media' ? 'Video' : id === 'visual' ? 'Ảnh' : 'Báo Cáo'} 
              </button> 
            ))} 
          </div> 
          <div className="bg-[#080808] border border-zinc-900 rounded-3xl p-8 focus-within:border-zinc-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all"> 
            <textarea className="w-full bg-transparent outline-none text-zinc-200 h-40 resize-none text-xl placeholder-zinc-900" placeholder="Ý tưởng của Hùng Đại là gì?" /> 
            <div className="flex justify-end pt-6 border-t border-zinc-900/50"> 
               <button className="px-12 py-3 bg-zinc-100 text-black font-bold rounded-full text-[10px] uppercase tracking-[0.2em] hover:bg-white active:scale-95 transition-all">Khai Phóng</button> 
            </div> 
          </div> 
        </div> 
      </main> 
 
      {/* Nút Toggle Phải tinh tế */} 
      <button onClick={()=>setR(!r)} className="fixed right-4 top-1/2 -translate-y-1/2 bg-zinc-900/50 p-1.5 rounded-full z-50 text-zinc-700 hover:text-white transition-all"> 
        {r ? <ChevronRight size={14}/> : <ChevronLeft size={14}/>} 
      </button> 
 
      {/* CÁNH PHẢI: DI SẢN (ẨN) */} 
      <aside className={`${r?'w-80 border-l':'w-0'} border-zinc-900 bg-[#050505] transition-all duration-500 overflow-hidden`}> 
        <div className="p-8 w-80"> 
          <div className="flex items-center gap-3 mb-10"><History size={16}/> <span className="text-[10px] font-bold uppercase tracking-widest text-white">Lưu Trữ</span></div> 
          <div className="space-y-6"> 
            {['Đang làm', 'Hoàn tất'].map(tag => ( 
              <div key={tag} className="space-y-3"> 
                <p className="text-[8px] text-zinc-600 font-bold uppercase tracking-[0.2em]">{tag}</p> 
                <div className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl hover:border-zinc-600 cursor-pointer transition-all"> 
                  <p className="text-[11px] text-zinc-500 italic line-clamp-1">Nội dung sáng tạo của bạn...</p> 
                </div> 
              </div> 
            ))} 
          </div> 
        </div> 
      </aside> 
    </div> 
  ); 
} 
