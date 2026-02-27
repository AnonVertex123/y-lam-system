import React, { useState, useEffect } from 'react'; 
import { Tag, X } from "lucide-react";

export const IdentityAnchors = () => { 
  const [anchors, setAnchors] = useState<string[]>([]); 
  const [inputValue, setInputValue] = useState(''); 

  useEffect(() => { 
    const saved = JSON.parse(localStorage.getItem('USER_ANCHORS') || '[]'); 
    setAnchors(saved); 
  }, []); 

  const addAnchor = (e: React.KeyboardEvent) => { 
    if (e.key === 'Enter' && inputValue.trim()) { 
      const newAnchors = [...new Set([...anchors, inputValue.trim()])]; 
      setAnchors(newAnchors); 
      localStorage.setItem('USER_ANCHORS', JSON.stringify(newAnchors)); 
      setInputValue(''); 
    } 
  }; 

  const removeAnchor = (tagToRemove: string) => {
    const newAnchors = anchors.filter(tag => tag !== tagToRemove);
    setAnchors(newAnchors);
    localStorage.setItem('USER_ANCHORS', JSON.stringify(newAnchors));
  };

  return ( 
    <div className="mt-6 p-5 border border-zinc-800 rounded-2xl bg-black/40 backdrop-blur-sm shadow-inner"> 
      <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2 mb-4">
        <Tag size={12} className="text-indigo-500" />
        TỪ KHÓA BẢO TỒN BẢN SẮC
      </label> 
      
      <div className="flex flex-wrap gap-2 mb-4"> 
        {anchors.length > 0 ? (
          anchors.map(tag => ( 
            <span key={tag} className="group flex items-center gap-2 px-3 py-1.5 bg-indigo-950/30 border border-indigo-500/30 text-indigo-200 text-xs rounded-xl hover:border-indigo-400 transition-all"> 
              {tag} 
              <button 
                onClick={() => removeAnchor(tag)}
                className="opacity-0 group-hover:opacity-100 text-indigo-400 hover:text-red-400 transition-all"
              >
                <X size={12} />
              </button>
            </span> 
          ))
        ) : (
          <p className="text-[10px] italic text-zinc-600 uppercase tracking-widest py-2">Chưa có từ khóa bản sắc...</p>
        )}
      </div> 

      <input 
        value={inputValue} 
        onChange={(e) => setInputValue(e.target.value)} 
        onKeyDown={addAnchor} 
        placeholder="Nhập từ và nhấn Enter (VD: An Định, VitaDAO...)" 
        className="w-full p-3 bg-zinc-900/50 border border-zinc-800 rounded-xl text-sm text-zinc-300 focus:border-indigo-500/50 focus:outline-none transition-all placeholder:text-zinc-700" 
      /> 
      <p className="mt-2 text-[9px] text-zinc-600 italic tracking-wider">
        * Hệ thống Ý Lâm ASI sẽ cưỡng chế giữ nguyên định dạng các từ này khi Chuyển di Văn hóa.
      </p>
    </div> 
  ); 
}; 
