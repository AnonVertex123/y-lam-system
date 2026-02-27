"use client";
import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { z } from "zod";
import { GlowInput } from "@/components/GlowInput";
import PrimaryButton from "@/components/PrimaryButton";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Mật khẩu tối thiểu 8 ký tự")
      .refine((v) => /[!@#$%^&*]/.test(v), {
        message:
          "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (ví dụ: @, #, $). / Password must contain at least one special character (e.g., @, #, $).",
      }),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { path: ["confirm"], message: "Mật khẩu không khớp" });

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setError("Liên kết không hợp lệ hoặc đã hết hạn");
      } else {
        setReady(true);
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setPasswordError(null);
    const parsed = schema.safeParse({ password, confirm });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue?.path?.[0] === "password") {
        setPasswordError(issue.message);
      } else {
        setError(issue?.message ?? "Dữ liệu không hợp lệ");
      }
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) {
        setError(upErr.message || "Không thể cập nhật mật khẩu");
      } else {
        setInfo("Đã cập nhật mật khẩu. Bạn có thể quay lại đăng nhập.");
      }
    } catch {
      setError("Không thể cập nhật mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-dvh max-w-lg items-center px-6">
        <main className="yl-card w-full p-6 sm:p-8 text-center">
          <header className="mb-6 text-center">
            <div className="text-xs tracking-widest text-zinc-400">Sáng tạo vô hạn</div>
            <h1 className="mt-1 text-2xl font-semibold animate-pulse">Ý Lâm</h1>
            <p className="mt-1 text-sm text-zinc-400">Đặt lại mật khẩu của bạn</p>
          </header>
          {!ready ? (
            <p className="text-sm text-zinc-400">Đang xác minh liên kết...</p>
          ) : (
            <form onSubmit={onSubmit} className="space-y-4">
              <GlowInput
                type={showNew ? "text" : "password"}
                label="Mật khẩu mới"
                placeholder="Tối thiểu 8 ký tự và có ký tự đặc biệt"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                icon={<ShieldCheck size={18} />}
                trailing={
                  <button
                    type="button"
                    aria-label={showNew ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowNew((v) => !v)}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {passwordError && <div className="text-xs text-red-400">{passwordError}</div>}
              <GlowInput
                type={showConfirm ? "text" : "password"}
                label="Xác nhận mật khẩu"
                placeholder="Nhập lại mật khẩu"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                icon={<ShieldCheck size={18} />}
                trailing={
                  <button
                    type="button"
                    aria-label={showConfirm ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    onClick={() => setShowConfirm((v) => !v)}
                    className="text-zinc-500 hover:text-zinc-200 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              {error && <div className="text-sm text-red-400">{error}</div>}
              {info && <div className="text-sm text-emerald-400">{info}</div>}
              <PrimaryButton disabled={loading} type="submit">
                {loading ? "Đang cập nhật..." : "Cập nhật mật khẩu"}
              </PrimaryButton>
              <p className="text-xs text-white text-center">Created by Hùng Đại & Tự Minh</p>
            </form>
          )}
        </main>
      </div>
    </div>
  );
}
