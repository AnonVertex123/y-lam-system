"use client"; 
 
import { getSupabaseBrowser } from "@/lib/supabase-browser"; 
import { LogOut, Globe } from "lucide-react"; 
import { useI18n } from "@/components/I18nProvider";
import clsx from "clsx";

export default function SystemUtilities({ minimal = false }: { minimal?: boolean }) { 
  const supabase = getSupabaseBrowser(); 
  const { locale, setLocale, t } = useI18n();

  const handleSignOut = async () => { 
    // 1. Lệnh cưỡng chế Supabase hủy bỏ session 
    const { error } = await supabase.auth.signOut(); 
 
    if (error) { 
      console.error("Lỗi khi thoát:", error.message); 
    } else { 
      // 2. Tẩy sạch bộ nhớ đệm và quay về cổng chính 
      window.location.href = "/"; 
    } 
  }; 

  const toggleLocale = () => {
    setLocale(locale === "vi" ? "en" : "vi");
  };
 
  return ( 
    <div className={clsx(
      "flex items-center px-2",
      minimal ? "flex-col gap-6" : "gap-6 px-4"
    )}> 
      
      {/* 1. Component Đổi ngôn ngữ */} 
      <div 
        onClick={toggleLocale}
        title={minimal ? `Ngôn ngữ: ${locale.toUpperCase()}` : undefined}
        className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer transition-colors group"
      > 
        <Globe size={18} className="group-hover:rotate-12 transition-transform" /> 
        {!minimal && <span className="text-sm font-medium uppercase">{locale}</span>} 
      </div> 
    
      {/* Đường kẻ phân cách tinh tế */} 
      {!minimal && <div className="w-[1px] h-4 bg-zinc-800" />} 
    
      {/* 2. Nút Thoát (Sign Out) */} 
      <button 
        onClick={handleSignOut} 
        title={minimal ? "Thoát" : undefined}
        className="flex items-center gap-2 text-zinc-400 hover:text-red-400 transition-all duration-300 group" 
      > 
        {!minimal && <span className="text-sm font-medium">Thoát</span>} 
        <LogOut size={18} className="group-hover:translate-x-1 transition-transform" /> 
      </button> 
    
    </div> 
  ); 
}
