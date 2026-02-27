import React, { useState, useEffect } from 'react'; 
import { IdentityAnchors } from './IdentityAnchors';
 
export const ApiSettings = () => { 
  const [keys, setKeys] = useState({ assembly: '', deepgram: '' }); 
 
  useEffect(() => { 
    const saved = { 
      assembly: localStorage.getItem('ASSEMBLY_KEY') || '', 
      deepgram: localStorage.getItem('DEEPGRAM_KEY') || '' 
    }; 
    setKeys(saved); 
  }, []); 
 
  const handleSave = () => { 
    localStorage.setItem('ASSEMBLY_KEY', keys.assembly); 
    localStorage.setItem('DEEPGRAM_KEY', keys.deepgram); 
    alert('Năng lượng đã được nạp thành công, Hùng Đại!'); 
  }; 
 
  return ( 
    <div className="p-6 bg-black border border-gray-800 rounded-lg shadow-2xl mb-8 animate-in fade-in slide-in-from-top-4 duration-500"> 
      <h3 className="text-xl font-bold text-white mb-4 italic uppercase tracking-widest">Trung Tâm Năng Lượng Ý Lâm</h3> 
      <div className="space-y-4"> 
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">AssemblyAI Key</label>
            <input 
              type="password" 
              placeholder="Dán AssemblyAI Key..." 
              className="w-full p-3 bg-zinc-900/50 border border-zinc-800 text-gray-300 rounded-xl focus:border-zinc-500 outline-none transition-all text-sm" 
              value={keys.assembly} 
              onChange={(e) => setKeys({...keys, assembly: e.target.value})} 
            /> 
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-zinc-500 uppercase tracking-widest ml-1">Deepgram Key</label>
            <input 
              type="password" 
              placeholder="Dán Deepgram Key..." 
              className="w-full p-3 bg-zinc-900/50 border border-zinc-800 text-gray-300 rounded-xl focus:border-zinc-500 outline-none transition-all text-sm" 
              value={keys.deepgram} 
              onChange={(e) => setKeys({...keys, deepgram: e.target.value})} 
            /> 
          </div>
        </div>

        <button 
          onClick={handleSave} 
          className="w-full py-3 bg-zinc-100 hover:bg-white text-black font-black uppercase tracking-[0.2em] text-xs rounded-xl transition-all active:scale-95 shadow-xl shadow-white/5" 
        > 
          KÍCH HOẠT MẠCH DẪN 
        </button> 

        <IdentityAnchors />
      </div> 
    </div> 
  ); 
}; 
