"use client"; 
 
import { useCallback, useEffect, useMemo, useState } from "react"; 
import clsx from "clsx";
import { ShieldCheck, Settings, Save, X, Copy, LogOut } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser"; 
import { useRouter } from "next/navigation"; 
import { useI18n } from "@/components/I18nProvider";
import { ApiSettings } from "@/components/ApiSettings";
import { useTranscription } from "@/hooks/useTranscription";
import { CacheService } from "@/services/CacheService";

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

  const { runTranscription } = useTranscription();

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Đã sao chép vào bộ nhớ tạm, Hùng Đại!");
  };

  const handleManualProcess = useCallback(async () => {
    if (!transcription.trim()) return;
    setIsProcessing(true);
    setProcessingStatus("Đang chuyển hóa tri thức...");
    setInlineError(null);
    setSummary(null);
    setGates(null);

    try {
      const res = await fetch('/api/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          rawText: transcription, 
          selectedGates: ['Viral', 'Minh Triết', 'Nghệ Thuật', 'Tiến Hóa'] 
        })
      });
      const data = await res.json();
      if (data.summary) {
        setSummary(data.summary);
        setGates(data.gates);
        console.log("✅ Chuyển hóa thủ công thành công!");
      } else {
        setInlineError(data.error || "Không thể chuyển hóa văn bản.");
      }
    } catch (error) {
      console.error("Lỗi chuyển hóa thủ công:", error);
      setInlineError("Lỗi kết nối mạch dẫn ASI.");
    } finally {
      setIsProcessing(false);
    }
  }, [transcription]);

  const handleProcessVideo = useCallback(async () => {
    const input = youtubeUrl.trim();
    if (!input) {
      setInlineError("Hùng Đại ơi, bạn quên bỏ ý tưởng của mình cho tôi phân tích rồi hihihi");
      return;
    }

    setIsProcessing(true);
    setInlineError(null);
    setTranscription("");
    setSummary(null);
    setGates(null);

    try {
      // BƯỚC 1: Hỏi "Thủ thư" xem đã từng bóc tách video này chưa
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
        setTranscription(data.text || data.transcription || "");
        setSummary(data.summary || null);
        setGates(data.gates || null);
        
        // BƯỚC 3: Lưu ngay vào Ký ức
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

  const handleSignOut = async () => { 
    await supabase.auth.signOut(); 
    router.push("/onboarding"); 
  }; 
 
  if (!userEmail) { 
    return ( 
      <div className="min-h-screen bg-black flex items-center justify-center"> 
        <p className="text-zinc-500 animate-pulse uppercase tracking-[0.3em] text-xs">Đang đồng bộ tư duy...</p> 
      </div> 
    ); 
  } 
 
  return ( 
    <div className="min-h-screen bg-black text-zinc-300 font-sans selection:bg-white selection:text-black"> 
      <div className="mx-auto max-w-4xl px-6 py-12 sm:py-20"> 
        
        {/* HEADER: TRẠM CHỈ HUY */}
        <header className="bg-[#111] border border-zinc-800 p-8 rounded-3xl text-center shadow-2xl mb-12 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-800/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <h1 className="text-3xl font-black text-white mb-2 tracking-[0.2em] uppercase">Trạm Chỉ Huy Ý Lâm</h1> 
          <p className="text-zinc-500 text-xs tracking-widest mb-6">
            Hệ thống nhận diện: <span className="text-zinc-300 font-mono">{userEmail}</span> 
          </p> 
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"> 
            <div className="p-4 border border-zinc-800/50 rounded-xl bg-black/50 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Trạng thái lõi</span>
              <span className="text-green-500 font-mono text-xs">AN ĐỊNH</span>
            </div>
            <div className="p-4 border border-zinc-800/50 rounded-xl bg-black/50 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Mạch Supabase</span>
              <span className="text-green-500 font-mono text-xs">KẾT NỐI</span>
            </div>
            <div className="p-4 border border-zinc-800/50 rounded-xl bg-black/50 flex flex-col items-center">
              <span className="text-[10px] uppercase tracking-widest text-zinc-600 mb-1">Trí tuệ Gemini</span>
              <span className="text-yellow-500 font-mono text-xs">CHỜ LỆNH</span>
            </div>
          </div> 

          <div className="flex justify-center gap-4">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              <Settings size={14} />
              {showSettings ? "Đóng thiết lập" : "Thiết lập API"}
            </button>
            <button 
              onClick={handleSignOut} 
              className="flex items-center gap-2 text-[10px] uppercase tracking-widest text-red-900/50 hover:text-red-500 transition-colors"
            >
              <LogOut size={14} />
              Ngắt kết nối
            </button> 
          </div>
        </header>

        {/* API Settings Panel */}
        {showSettings && (
          <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
            <ApiSettings />
          </div>
        )}

        {/* INPUT: KHAI PHÓNG TRI THỨC */}
        <div className="relative mb-16"> 
          <div className="yl-card p-1 rounded-2xl bg-gradient-to-r from-zinc-800 to-zinc-900 shadow-2xl">
            <input 
              value={youtubeUrl} 
              onChange={(e) => setYoutubeUrl(e.target.value)} 
              placeholder="Dán link YouTube tại đây..." 
              className={clsx(
                "w-full rounded-xl bg-black px-6 py-5 text-lg text-white focus:outline-none transition-all placeholder:text-zinc-700",
                isProcessing && "opacity-50 cursor-not-allowed"
              )} 
            /> 
          </div>
          {inlineError && ( 
            <p className="mt-4 text-red-500 text-xs font-bold text-center animate-pulse uppercase tracking-widest">{inlineError}</p> 
          )} 
          
          <button 
            onClick={handleProcessVideo} 
            disabled={isProcessing || !youtubeUrl} 
            className="mt-8 w-full py-5 rounded-xl border border-zinc-800 bg-white text-black font-black uppercase tracking-[0.4em] text-sm hover:bg-zinc-200 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-30 shadow-[0_0_40px_rgba(255,255,255,0.1)]" 
          > 
            {isProcessing ? processingStatus : "Khai Phóng Tri Thức"} 
          </button>

          {/* Cổng phụ: Dán văn bản thủ công */} 
          <div className="mt-8 border-t border-zinc-900 pt-8"> 
            <details className="group"> 
              <summary className="text-zinc-600 cursor-pointer hover:text-zinc-400 text-[10px] uppercase tracking-[0.3em] transition-colors list-none flex items-center justify-center gap-3"> 
                <span className="w-1.5 h-1.5 rounded-full bg-amber-900 group-open:bg-amber-500 transition-colors" />
                Cổng phụ: Dán văn bản thủ công
              </summary> 
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <textarea 
                  className="w-full p-5 bg-[#050505] border border-zinc-900 rounded-xl text-zinc-500 text-sm h-48 focus:outline-none focus:border-amber-900/30 transition-all placeholder:text-zinc-800 font-serif italic" 
                  placeholder="Dán phụ đề copy từ YouTube vào đây..." 
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)} 
                /> 
                <button
                  onClick={handleManualProcess}
                  disabled={isProcessing || !transcription.trim()}
                  className="w-full py-4 rounded-lg border border-amber-900/20 bg-amber-950/5 text-amber-700 text-[10px] font-bold uppercase tracking-[0.4em] hover:bg-amber-950/10 hover:text-amber-500 transition-all disabled:opacity-20"
                >
                  {isProcessing ? "Đang chuyển hóa..." : "Kích hoạt Chuyển di Tri thức"}
                </button>
              </div>
            </details> 
          </div>
        </div> 

        {/* RESULTS: HỆ SINH THÁI TRI THỨC */}
        <div className="space-y-12">
          {/* Tầng 1: TỔNG KẾT */}
          {summary && (
            <div className="yl-card border border-zinc-800 bg-[#0a0a0a] rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
              <div className="p-6 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500">Tóm lược hạt nhân</h2>
                <button onClick={() => handleCopy(`${summary.core_essence}\n\nGiá trị: ${summary.practical_value}`)} className="text-zinc-600 hover:text-white transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <div className="p-10 space-y-6">
                <p className="text-zinc-100 leading-relaxed font-serif text-2xl italic text-center">"{summary.core_essence}"</p>
                <div className="pt-8 border-t border-zinc-900">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-600 block mb-3 text-center">Giá trị thực tiễn</span>
                  <p className="text-zinc-400 text-sm leading-relaxed text-center px-4">{summary.practical_value}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tầng 2: CÁC CÁNH CỔNG (GATES) */}
          {gates && (
            <div className="grid grid-cols-1 gap-8">
              {Object.entries(gates).map(([key, gate]: [string, any]) => gate.active && (
                <div key={key} className="yl-card border border-zinc-800 bg-[#080808] rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
                  <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/10">
                    <h3 className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-500">{gate.title}</h3>
                    <button onClick={() => handleCopy(JSON.stringify(gate.content, null, 2))} className="text-zinc-600 hover:text-white transition-colors">
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="p-8">
                    <pre className="text-zinc-500 text-xs font-mono whitespace-pre-wrap leading-loose">
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
                <h2 className="text-[9px] font-black tracking-[0.3em] uppercase text-zinc-700">Mạch dẫn gốc (Raw)</h2>
                <button onClick={() => handleCopy(transcription)} className="text-zinc-800 hover:text-zinc-400 transition-colors">
                  <Copy size={14} />
                </button>
              </div>
              <div className="p-10">
                <p className="text-zinc-600 text-xs leading-relaxed font-serif line-clamp-[10] hover:line-clamp-none transition-all cursor-pointer">
                  {transcription}
                </p>
              </div>
            </div>
          )}
        </div>
      </div> 
    </div> 
  ); 
}
