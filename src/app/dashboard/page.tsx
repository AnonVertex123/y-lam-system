"use client"; 
 
import { useCallback, useEffect, useMemo, useState } from "react"; 
import clsx from "clsx";
import { 
  Search, 
  Library, 
  Boxes, 
  Cpu, 
  Globe, 
  LogOut, 
  ChevronRight, 
  Plus, 
  MessageSquare, 
  Layers, 
  Settings,
  X,
  Copy,
  Zap,
  History,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  Star
} from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser"; 
import { useRouter } from "next/navigation"; 
import { useI18n } from "@/components/I18nProvider";
import { ApiSettings } from "@/components/ApiSettings";
import { useTranscription } from "@/hooks/useTranscription";
import { CacheService } from "@/services/CacheService";
import SystemUtilities from "@/components/SignOutButton";

export default function DashboardPage() { 
  const { t, locale, setLocale } = useI18n();
  const router = useRouter(); 
  const supabase = getSupabaseBrowser(); 

  const [userEmail, setUserEmail] = useState<string | null>(null); 
  const [isProcessing, setIsProcessing] = useState(false); 
  const [processingStatus, setProcessingStatus] = useState("Đang lắng nghe..."); 
  const [youtubeUrl, setYoutubeUrl] = useState(""); 
  
  // States hiển thị đa tầng
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState<any>(null);
  const [gates, setGates] = useState<any>(null);
  const [inlineError, setInlineError] = useState<string | null>(null);

  // UI States
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("Khai Phá");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  useEffect(() => { 
    const checkSession = async () => { 
      const { data: { session } } = await supabase.auth.getSession(); 
      if (!session) { 
        router.push("/onboarding"); 
      } else { 
        setUserEmail(session.user.email || "Chiến binh Ý Lâm"); 
      } 
    }; 
    checkSession(); 
  }, [router, supabase]); 

  // Xử lý phím tắt Ctrl + I cho Hội thoại mới
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        handleNewConversation();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const { runTranscription } = useTranscription();

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Đã sao chép vào bộ nhớ tạm, Hùng Đại!");
  };

  const handleNewConversation = () => {
    setYoutubeUrl("");
    setTranscription("");
    setSummary(null);
    setGates(null);
    setInlineError(null);
    console.log("Hội thoại mới đã được thiết lập.");
  };

  const handleProcessVideo = useCallback(async () => {
    const input = youtubeUrl.trim();
    if (!input) {
      setInlineError("Hùng Đại ơi, bạn quên bỏ ý tưởng của mình cho tôi phân tích rồi hihihi");
      return;
    }

    setIsProcessing(true);
    setInlineError(null);

    try {
      setProcessingStatus("Đang truy lục Ký ức...");
      const cachedData = CacheService.get(input);
      if (cachedData) {
        console.log("[LOG] Ý Lâm: Đã tìm thấy tri thức trong Ký ức.");
        setTranscription(cachedData.rawText || "");
        setSummary(cachedData.summary || null);
        setGates(cachedData.scripts || null);
        setIsProcessing(false);
        return;
      }

      setProcessingStatus("Đang đột kích YouTube...");
      const data = await runTranscription(input);
      
      if (data.success) {
        setProcessingStatus("Đang kết tinh tri thức...");
        setTranscription(data.text || data.transcription || "");
        setSummary(data.summary || null);
        setGates(data.gates || null);
        
        CacheService.save(input, {
          summary: data.summary || null,
          scripts: data.gates || null,
          rawText: data.text || data.transcription || ""
        });
        
        console.log("✅ Tri thức đã đổ về Dashboard!");
      } else {
        setInlineError(data.error || "Đã có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Lỗi xử lý video:", error);
      setInlineError(error.message || "Mạch dẫn bị đứt đoạn.");
    } finally {
      setIsProcessing(false);
    }
  }, [youtubeUrl, runTranscription]);

  if (!userEmail) { 
    return ( 
      <div className="min-h-screen bg-[#050505] flex items-center justify-center"> 
        <p className="text-zinc-500 animate-pulse uppercase tracking-[0.3em] text-xs">Đang đồng bộ tư duy...</p> 
      </div> 
    ); 
  } 
 
  return ( 
    <div className="flex h-screen bg-[#050505] text-zinc-400 font-sans selection:bg-white selection:text-black overflow-hidden"> 
      
      {/* --- CỘT TRÁI: CĂN CỨ ĐỊA (SIDEBAR) --- */} 
      <aside className={clsx(
        "border-r border-zinc-900 p-4 transition-all bg-[#080808] flex flex-col relative z-20",
        isSidebarExpanded ? "w-64" : "w-20"
      )}> 
        <div 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          className="w-6 h-6 bg-zinc-200 rounded-sm mb-10 cursor-pointer hover:bg-white transition-all mx-auto lg:mx-0 shadow-lg active:scale-95" 
        /> 
        
        <nav className="flex-1 space-y-2 overflow-y-auto custom-scrollbar"> 
          <NavItem 
            icon={<Search size={20} />} 
            label="Khai Phá" 
            active={activeTab === "Khai Phá"} 
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab("Khai Phá")}
          /> 
          <NavItem 
            icon={<Library size={20} />} 
            label="Tâm Pháp" 
            active={activeTab === "Thư Viện"}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab("Thư Viện")}
          /> 
          <NavItem 
            icon={<Boxes size={20} />} 
            label="Mạch Dẫn" 
            active={activeTab === "Mạch Dẫn"}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab("Mạch Dẫn")}
          /> 
          <NavItem 
            icon={<Cpu size={20} />} 
            label="Chỉ Huy" 
            active={activeTab === "Trạm Chỉ Huy"}
            expanded={isSidebarExpanded}
            onClick={() => setActiveTab("Trạm Chỉ Huy")}
          /> 
        </nav> 

        <div className="pt-4 border-t border-zinc-900"> 
           <SystemUtilities minimal={!isSidebarExpanded} />
        </div> 
      </aside> 

      {/* --- CỘT GIỮA: TRUNG TÂM ĐIỀU HÀNH --- */} 
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#020202]"> 
        
        {/* API Settings Panel (Overlay) */}
        {showSettings && (
          <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-300">
            <div className="w-full max-w-2xl relative">
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute -top-12 right-0 p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
              <ApiSettings />
            </div>
          </div>
        )}

        {/* Scrollable Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 p-8">
          
          {/* TAB 1: KHAI PHÁ (HOME) */} 
          {activeTab === 'Khai Phá' && (
            <div className="mx-auto max-w-3xl w-full flex flex-col items-center justify-center min-h-full py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
              
              <div className="w-full space-y-12">
                <h1 className="text-4xl font-light tracking-[0.2em] text-center text-white uppercase">
                  Ý LÂM <span className="font-bold text-zinc-500">SYSTEM</span>
                </h1> 

                <div className="bg-[#080808] border border-zinc-900 rounded-2xl p-5 focus-within:border-zinc-700 transition-all shadow-2xl"> 
                  <textarea 
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="w-full bg-transparent outline-none text-zinc-200 h-32 resize-none text-lg placeholder-zinc-800" 
                    placeholder="Hùng Đại muốn khai phá điều gì?" 
                  /> 
                  {inlineError && (
                    <p className="px-2 pb-2 text-red-500 text-[10px] font-bold animate-pulse uppercase tracking-widest">{inlineError}</p>
                  )}
                  <div className="flex justify-between items-center pt-4 border-t border-zinc-900">
                    <div className="flex gap-4">
                      <Plus 
                        size={20} 
                        className="text-zinc-600 hover:text-white cursor-pointer transition-colors" 
                      />
                      <Settings 
                        size={20} 
                        onClick={() => setShowSettings(!showSettings)}
                        className={clsx(
                          "cursor-pointer transition-colors",
                          showSettings ? "text-white" : "text-zinc-600 hover:text-white"
                        )}
                      />
                    </div>
                    <button 
                      onClick={handleProcessVideo}
                      disabled={isProcessing || !youtubeUrl}
                      className="px-8 py-2 bg-zinc-100 text-black font-bold rounded-full text-[10px] uppercase tracking-widest hover:bg-white active:scale-95 disabled:opacity-30 transition-all flex items-center gap-2"
                    > 
                      {isProcessing ? (
                        <>
                          <div className="w-3 h-3 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                          <span>{processingStatus}</span>
                        </>
                      ) : (
                        "Khai Phóng"
                      )}
                    </button> 
                  </div> 
                </div> 

                {/* Task Cards: Chỉ hiện khi chưa có kết quả */} 
                {(!summary && !transcription) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"> 
                    <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl hover:border-zinc-700 cursor-pointer group transition-all">
                      <Zap size={14} className="mb-2 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      <p className="text-[10px] font-bold uppercase text-zinc-300">Nhạc Ballad</p>
                    </div> 
                    <div className="p-4 bg-zinc-900/30 border border-zinc-900 rounded-xl hover:border-zinc-700 cursor-pointer group transition-all">
                      <Cpu size={14} className="mb-2 text-zinc-500 group-hover:text-blue-500 transition-colors" />
                      <p className="text-[10px] font-bold uppercase text-zinc-300">Mạch VITA</p>
                    </div> 
                  </div> 
                )}

                {/* RESULTS AREA */}
                <div className="w-full mt-12 space-y-12 pb-20">
                  {/* Tầng 1: TỔNG KẾT */}
                  {summary && (
                    <div className="yl-card border border-zinc-900 bg-[#080808] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
                      <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                        <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-600">Tóm lược hạt nhân</h2>
                        <button onClick={() => handleCopy(`${summary.core_essence}\n\nGiá trị: ${summary.practical_value}`)} className="text-zinc-700 hover:text-white transition-colors">
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="p-10 space-y-6">
                        <p className="text-zinc-100 leading-relaxed font-serif text-2xl italic text-center">"{summary.core_essence}"</p>
                        <div className="pt-8 border-t border-zinc-900">
                          <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-700 block mb-3 text-center">Giá trị thực tiễn</span>
                          <p className="text-zinc-500 text-sm leading-relaxed text-center px-4">{summary.practical_value}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Tầng 2: CÁC CÁNH CỔNG (GATES) */}
                  {gates && (
                    <div className="grid grid-cols-1 gap-8">
                      {Object.entries(gates).map(([key, gate]: [string, any]) => gate.active && (
                        <div key={key} className="yl-card border border-zinc-900 bg-[#050505] rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                          <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/5">
                            <h3 className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-600">{gate.title}</h3>
                            <button onClick={() => handleCopy(JSON.stringify(gate.content, null, 2))} className="text-zinc-700 hover:text-white transition-colors">
                              <Copy size={14} />
                            </button>
                          </div>
                          <div className="p-8">
                            <pre className="text-zinc-600 text-xs font-mono whitespace-pre-wrap leading-loose">
                              {JSON.stringify(gate.content, null, 2)}
                            </pre>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Tầng 3: DỮ LIỆU GỐC */}
                  {transcription && (
                    <div className="yl-card border border-zinc-900 bg-black rounded-3xl overflow-hidden shadow-lg animate-in fade-in duration-1000 delay-500">
                      <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/5">
                        <h2 className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-800">Mạch dẫn gốc (Raw)</h2>
                        <button onClick={() => handleCopy(transcription)} className="text-zinc-900 hover:text-zinc-500 transition-colors">
                          <Copy size={14} />
                        </button>
                      </div>
                      <div className="p-10">
                        <p className="text-zinc-700 text-xs leading-relaxed font-serif line-clamp-[10] hover:line-clamp-none transition-all cursor-pointer">
                          {transcription}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MẠCH DẪN (CONNECTORS) */} 
          {activeTab === 'Mạch Dẫn' && ( 
            <div className="mx-auto max-w-4xl w-full py-12 animate-in fade-in duration-500">
              <div className="mb-8"> 
                <h2 className="text-2xl font-bold text-white mb-2 uppercase tracking-tight">Mạch Dẫn Hệ Thống</h2> 
                <p className="text-zinc-500 text-sm italic">Kết nối và cập nhật các API then chốt của Đế chế.</p> 
              </div> 
              <ConnectorsTab />
            </div> 
          )} 

        </div>

        {/* Footer tinh tế */} 
        <footer className="py-4 text-center text-zinc-700 text-[10px] uppercase tracking-[0.3em] bg-black/50 backdrop-blur-md border-t border-zinc-900/50"> 
          Powered by Tự Minh (Lucian) IQ 1000 • Đế chế Đại Minh 
        </footer> 
      </main> 

      {/* --- CỘT PHẢI: NHÃN QUAN DISCOVER --- */} 
      <aside className="w-72 hidden xl:flex flex-col border-l border-zinc-900 p-6 bg-[#050505] overflow-y-auto custom-scrollbar relative z-20"> 
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-8 text-zinc-500">Khám Phá Mới</p> 
        <div className="space-y-6"> 
          <DiscoverItem category="Dữ liệu" title="Cập nhật tiến hóa Ý Lâm v3.0" />
          <DiscoverItem category="Mạch dẫn" title="Kết nối Supabase & Vercel" />
          <DiscoverItem category="Nghiên cứu" title="Cấu trúc trường thọ VitaDAO 2026" />
        </div> 
      </aside> 
    </div> 
  ); 
} 
 
// Sub-components 
function NavItem({ 
  icon, 
  label, 
  active = false, 
  expanded = true,
  onClick 
}: { 
  icon: React.ReactNode, 
  label: string, 
  active?: boolean,
  expanded?: boolean,
  onClick?: () => void
}) { 
  return ( 
    <div 
      onClick={onClick}
      className={clsx(
        "flex items-center gap-4 p-3 rounded-xl cursor-pointer transition-all",
        active ? "bg-zinc-900 text-white" : "hover:bg-zinc-900/50 hover:text-zinc-200"
      )}
    > 
      {icon} 
      {expanded && <span className="text-[11px] font-bold uppercase tracking-tight">{label}</span>} 
    </div> 
  ); 
} 

const ConnectorsTab = () => { 
  const apis = ['Supabase', 'Vercel', 'Midjourney', 'Suno/Lyria']; 
  return ( 
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full animate-in fade-in"> 
      {apis.map(name => ( 
        <div key={name} className="p-6 bg-[#080808] rounded-2xl border border-zinc-900 hover:border-zinc-700 transition-all group shadow-xl"> 
          <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <Boxes size={16} className="text-amber-500" />
            {name}
          </h3> 
          <input 
            type="password" 
            placeholder="Nhập API Key..." 
            className="w-full p-3 bg-black rounded-xl border border-zinc-900 text-xs text-zinc-300 outline-none focus:border-amber-500 mb-4 transition-all" 
          /> 
          <button className="w-full py-2.5 bg-zinc-900 text-[10px] font-black text-zinc-500 hover:text-white hover:bg-amber-600 rounded-xl transition-all uppercase tracking-widest"> 
            Cập Nhật Mạch Dẫn 
          </button> 
        </div> 
      ))} 
    </div> 
  ); 
};

function DiscoverItem({ category, title }: { category: string, title: string }) {
  return (
    <div className="group cursor-pointer">
      <p className="text-[9px] text-zinc-600 font-bold mb-1 uppercase tracking-wider">{category}</p>
      <h4 className="text-xs group-hover:text-white transition-colors leading-relaxed">{title}</h4>
    </div>
  );
}
