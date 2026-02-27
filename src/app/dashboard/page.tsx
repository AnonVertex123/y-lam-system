"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { ShieldCheck, Settings, Save, X, Copy } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { decryptString } from "@/lib/crypto";
import { useI18n } from "@/components/I18nProvider";
import { ApiSettings } from "@/components/ApiSettings";
import { useTranscription } from "@/hooks/useTranscription";
import { CacheService } from "@/services/CacheService";

export default function DashboardPage() {
  const { t, locale, setLocale } = useI18n();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("Đang lắng nghe...");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  
  // States hiển thị đa tầng
  const [transcription, setTranscription] = useState("");
  const [summary, setSummary] = useState<{ core_essence: string; practical_value: string } | null>(null);
  const [gates, setGates] = useState<any>(null);
  
  const [inlineError, setInlineError] = useState<string | null>(null);

  // BYOK States
  const [showSettings, setShowSettings] = useState(false);

  // Hàm hiển thị dữ liệu lên Dashboard (An Định)
  const displayToDashboard = (data: any) => {
    setTranscription(data.rawText || data.transcription || data.raw_data || "");
    setSummary(data.summary || null);
    setGates(data.scripts || data.gates || null);
  };

  // Hàm Copy "Sát thủ" - Một chạm là dính
  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    alert("Đã sao chép vào bộ nhớ tạm, Hùng Đại!");
  };

  const displayName = useMemo(() => {
    if (!userEmail) return "Tài khoản";
    const part = userEmail.split("@")[0] || userEmail;
    return part.length > 24 ? part.slice(0, 24) : part;
  }, [userEmail]);

  useEffect(() => {
    (async () => {
      try {
        const supabase = getSupabaseBrowser();
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);

        if (!user) return;

        // Tự động giải mã Key nếu có session (đơn giản hóa)
        const { data: profile } = await supabase.from("profiles").select("encrypted_api_key").eq("id", user.id).maybeSingle();
        const encObj = profile?.encrypted_api_key as any;
        if (encObj?.ciphertext) {
          // Lưu ý: Ở bản đơn giản này chúng ta giả định dùng một cơ chế pass mặc định hoặc bỏ qua nếu chưa verify.
          // Để đúng yêu cầu "Đơn giản hóa cốt lõi", tôi sẽ giữ decryptedKey từ env nếu không có key user.
        }
      } catch (err) {
        console.error("Init Error:", err);
      }
    })();
  }, []);

  const { runTranscription } = useTranscription();

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
          selectedGates: ['Viral', 'Minh Triết'] 
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

      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl: input })
      });
      const data = await res.json();
      
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
    } catch (error) {
      console.error("Lỗi kết nối mạch dẫn:", error);
      setInlineError("Lỗi kết nối mạch dẫn");
    } finally {
      setIsProcessing(false);
    }
  }, [youtubeUrl]);

  async function onSignOut() {
    const supabase = getSupabaseBrowser();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div className="min-h-dvh w-full bg-[#050505] text-zinc-100 font-sans">
      {/* Header / Menu */}
      <div className="absolute top-4 right-4 z-20 flex gap-2">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-4 py-2 text-xs backdrop-blur hover:border-zinc-600 transition-all"
        >
          {displayName}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-12 w-48 rounded-xl border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
            <button onClick={onSignOut} className="w-full px-4 py-3 text-left text-sm hover:bg-zinc-800 transition-colors">
              {t("common.signOut")}
            </button>
          </div>
        )}
      </div>

      <div className="mx-auto max-w-4xl px-6 py-20">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-black tracking-[0.3em] uppercase mb-2 animate-pulse">Ý LÂM</h1>
          <p className="text-zinc-500 text-sm tracking-widest italic">Audio-to-Text Core Engine</p>
        </header>

        {/* API Settings Toggle */}
        <div className="flex justify-end mb-4">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-500 hover:text-zinc-200 transition-colors"
          >
            <Settings size={14} />
            {showSettings ? "Đóng thiết lập" : "Thiết lập API Key"}
          </button>
        </div>

        {/* API Settings Panel */}
        {showSettings && <ApiSettings />}

        {/* Input Section */}
        <div className="relative mb-12">
          <input
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
            placeholder="Dán link YouTube tại đây..."
            className={clsx(
              "w-full rounded-2xl bg-zinc-900/50 border border-zinc-800 px-6 py-5 text-lg focus:outline-none focus:border-zinc-500 transition-all shadow-2xl",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          />
          {inlineError && (
            <p className="mt-3 text-red-500 text-xs font-bold animate-shake">{inlineError}</p>
          )}
          
          <button
            onClick={handleProcessVideo}
            disabled={isProcessing || !youtubeUrl}
            className="mt-6 w-full py-4 rounded-xl border border-zinc-700 bg-zinc-100 text-zinc-900 font-bold uppercase tracking-widest hover:bg-white hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
          >
            {isProcessing ? processingStatus : "Khai Phóng Tri Thức"}
          </button>

          {/* Cổng phụ: Dán văn bản thủ công khi bị chặn IP */} 
          <div className="mt-6 border-t border-zinc-800/50 pt-6"> 
            <details className="group"> 
              <summary className="text-zinc-500 cursor-pointer hover:text-zinc-300 text-[10px] uppercase tracking-[0.2em] transition-colors list-none flex items-center gap-2"> 
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Cổng phụ: Dán văn bản thủ công (Dự phòng)
              </summary> 
              <div className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <textarea 
                  className="w-full p-4 bg-zinc-900/30 border border-zinc-800 rounded-xl text-zinc-400 text-sm h-40 focus:outline-none focus:border-amber-900/50 transition-all placeholder:text-zinc-700 font-serif italic" 
                  placeholder="Dán phụ đề copy từ YouTube vào đây..." 
                  value={transcription}
                  onChange={(e) => setTranscription(e.target.value)} 
                /> 
                <button
                  onClick={handleManualProcess}
                  disabled={isProcessing || !transcription.trim()}
                  className="w-full py-3 rounded-lg border border-amber-900/30 bg-amber-950/10 text-amber-500 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-amber-900/20 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Đang xử lý..." : "Khai Phóng Văn Bản Thủ Công"}
                </button>
              </div>
            </details> 
          </div>
        </div>

        {/* Result Section */}
        <div className="space-y-8">
          {/* Tầng 1: TỔNG KẾT & ĐÁNH GIÁ */}
          {summary && (
            <div className="yl-card border border-indigo-900/30 bg-indigo-950/5 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-6 border-b border-indigo-900/20 flex justify-between items-center bg-indigo-950/20">
                <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-indigo-400">Tổng Kết & Đánh Giá</h2>
                <button onClick={() => handleCopy(`${summary.core_essence}\n\nGiá trị: ${summary.practical_value}`)} className="text-indigo-500 hover:text-indigo-300 transition-colors">
                  <Copy size={16} />
                </button>
              </div>
              <div className="p-8 space-y-4">
                <p className="text-zinc-200 leading-relaxed font-serif text-xl italic">"{summary.core_essence}"</p>
                <div className="pt-4 border-t border-zinc-800/50">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 block mb-2">Giá trị thực tiễn:</span>
                  <p className="text-zinc-400 text-sm leading-relaxed">{summary.practical_value}</p>
                </div>
              </div>
            </div>
          )}

          {/* Tầng 2: CÁC KỊCH BẢN TÙY BIẾN */}
          {gates && (
            <div className="grid grid-cols-1 gap-6">
              {Object.entries(gates).map(([key, gate]: [string, any]) => gate.active && (
                <div key={key} className="yl-card border border-zinc-800 bg-zinc-900/20 rounded-3xl overflow-hidden shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                  <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/40">
                    <h3 className="text-xs font-bold tracking-[0.2em] uppercase text-zinc-400">{gate.title}</h3>
                    <button onClick={() => handleCopy(JSON.stringify(gate.content, null, 2))} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                  <div className="p-6">
                    <pre className="text-zinc-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                      {JSON.stringify(gate.content, null, 2)}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tầng 3: DỮ LIỆU GỐC (RAW TEXT) */}
          <div className="yl-card border border-zinc-800 bg-zinc-900/10 rounded-3xl overflow-hidden shadow-lg">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
              <h2 className="text-sm font-bold tracking-[0.2em] uppercase text-zinc-500">Dữ liệu gốc (Raw Text)</h2>
              <div className="flex gap-4">
                <button onClick={() => handleCopy(transcription)} className="text-zinc-600 hover:text-zinc-400 transition-colors">
                  <Copy size={16} />
                </button>
                <ShieldCheck size={18} className="text-zinc-700" />
              </div>
            </div>
            <div className="p-8 min-h-[200px] max-h-[500px] overflow-y-auto text-zinc-500 leading-relaxed whitespace-pre-wrap font-serif text-base scrollbar-thin scrollbar-thumb-zinc-800">
              {transcription || (
                <div className="h-full flex flex-col items-center justify-center italic py-20">
                  <p className="text-xs uppercase tracking-widest opacity-30">
                    {isProcessing ? processingStatus : "Đang chờ mạch dẫn..."}
                  </p>
                </div>
              )}
            </div>
            <div className="p-4 bg-zinc-900/40 border-t border-zinc-800/50 flex justify-center">
              <span className="text-[10px] text-zinc-700 tracking-widest uppercase font-bold">© 2026 Ý LÂM ASI EMPIRE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
