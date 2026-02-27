"use client";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import clsx from "clsx";
import { saveApiKeyEncrypted } from "@/lib/secure-store";
import { KeyRound, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { GlowInput } from "@/components/GlowInput";
import PrimaryButton from "@/components/PrimaryButton";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { encryptString, decryptString } from "@/lib/crypto";
import { useRouter } from "next/navigation";
import { validateGoogleStudioKey } from "@/lib/gemini";
import { useI18n } from "@/components/I18nProvider";

export default function OnboardingPage() {
  const router = useRouter();
  const { t, locale, setLocale } = useI18n();
  const [mode, setMode] = useState<"login" | "register" | "forgot">("login");
  const [regStep, setRegStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const [geminiError, setGeminiError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [validatedKey, setValidatedKey] = useState(false);
  const [showRegPwd, setShowRegPwd] = useState(false);
  const [showLoginPwd, setShowLoginPwd] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(false); // Trạng thái xác thực email

  // Hàm kiểm tra sự tồn tại của thực thể
  const checkEmailExistence = async () => {
    if (!email.includes("@") || mode !== "login") return;
    
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      if (error) {
        console.error("Lỗi truy vấn:", error);
        return;
      }

      if (!data) {
        alert("⚠️ Thực thể này chưa tồn tại trong Ý Lâm. Vui lòng đăng ký trước!");
        setIsEmailVerified(false);
      } else {
        setIsEmailVerified(true);
      }
    } catch (err) {
      console.error("Lỗi hệ thống khi check email:", err);
    } finally {
      setLoading(false);
    }
  };

  const registerSchema = useMemo(() => {
    return z
      .object({
        email: z.string().email(t("onboarding.emailInvalidError")),
        apiKey: z.string().min(8, t("onboarding.apiKeyInvalidError")),
        password: z.string().min(8, t("onboarding.passwordMin8Error")),
      })
      .refine((v) => /[!@#$%^&*]/.test(v.password), {
        path: ["password"],
        message: t("onboarding.passwordSpecialError"),
      });
  }, [t]);

  const loginSchema = useMemo(() => {
    return z.object({
      email: z.string().email(t("onboarding.emailInvalidError")),
      password: z.string().min(6, t("onboarding.passwordMin6Error")),
    });
  }, [t]);

  const forgotSchema = useMemo(() => {
    return z.object({
      email: z.string().email(t("onboarding.emailInvalidError")),
    });
  }, [t]);

  useEffect(() => {
    try {
      const remembered = localStorage.getItem("rememberedEmail");
      if (remembered) setEmail(remembered);
    } catch {
      // ignore
    }

      // KHAI PHÓNG: Kiểm tra session hiện có để vào thẳng Dashboard
    const checkActiveSession = async () => {
      const supabase = getSupabaseBrowser();
      const { data: { session } } = await supabase.auth.getSession();
      if (session && window.location.pathname !== "/dashboard") {
        console.log("Ý LÂM: Đã nhận diện phiên làm việc cũ. Tiến vào Dashboard...");
        router.push("/dashboard");
      }
    };
    checkActiveSession();
  }, [router]);

  useEffect(() => {
    try {
      getSupabaseBrowser();
      setEnvError(null);
    } catch (e) {
      let msg = t("onboarding.rememberedEnvMissing");
      if (e instanceof Error && e.message) {
        msg = e.message;
      }
      setEnvError(msg);
    }
  }, [t]);

  // Đăng ký tài khoản (hoàn tất ở Bước 3)
  const onRegisterComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setGeminiError(null);
    setPasswordError(null);
    setEmailError(null);
    if (!validatedKey) {
      setGeminiError(t("onboarding.verifyBeforeComplete"));
      setRegStep(2);
      return;
    }
    const parsed = registerSchema.safeParse({ email, apiKey, password });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      if (issue?.path?.[0] === "password") {
        setPasswordError(issue.message);
      } else {
        setError(issue?.message ?? t("onboarding.invalidData"));
      }
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();

      // 1. Kiểm tra nhanh ở bảng Profiles trước để báo lỗi sớm cho người dùng 
      const { data: profileCheck } = await supabase 
        .from('profiles') 
        .select('email') 
        .eq('email', email) 
        .maybeSingle(); 
  
      if (profileCheck) { 
        alert("❌ Thực thể này đã tồn tại trong Ý Lâm! Vui lòng Đăng nhập thay vì Đăng ký."); 
        setLoading(false); 
        setMode("login");
        return; 
      }

      const { data: signData, error: signErr } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/onboarding/update-password`, 
        } 
      });
      if (signErr) {
        console.log("Supabase signUp error:", signErr);
        const msg = (signErr.message || "").toLowerCase();
        if (msg.includes("signups not allowed") || msg.includes("signup is disabled") || msg.includes("signup disabled")) {
          setError(t("onboarding.signupDisabled"));
        } else if (msg.includes("email") && (msg.includes("disabled") || msg.includes("not allowed"))) {
          setError(t("onboarding.emailProviderDisabled"));
        } else if (msg.includes("already") || msg.includes("exists") || msg.includes("registered")) {
          setError(t("onboarding.emailInUse"));
        } else if (msg.includes("rate") && msg.includes("limit")) {
          setError(t("onboarding.rateLimited"));
        } else {
          setError(signErr.message || t("onboarding.cannotRegister"));
        }
        return;
      }

      // ĐIỂM MẤU CHỐT: Xử lý identities rỗng (User đã tồn tại trong Auth nhưng có thể chưa có Profile)
      if (signData?.user?.identities?.length === 0) {
        alert("⚠️ Email này đã được sử dụng. Hãy kiểm tra hộp thư hoặc Đăng nhập.");
        setLoading(false);
        setMode("login");
        return;
      }

      const enc = await encryptString(apiKey.trim(), password);

      if (!signData?.session) {
        try {
          localStorage.setItem("rememberedEmail", email);
          localStorage.setItem("yl.pendingEncryptedApi", JSON.stringify(enc));
          localStorage.setItem("yl.pendingEmail", email);
        } catch {}
        alert("✅ Khởi tạo thực thể thành công! Hãy kiểm tra Email để xác nhận.");
        setInfo(t("onboarding.accountCreatedConfirmEmail"));
        setMode("login");
        return;
      }

      // KHAI PHÓNG: Cưỡng chế chuyển hướng ngay lập tức nếu có session
      setInfo("Đăng ký thành công! Đang tiến vào Ý Lâm...");
      console.log("Đăng ký thành công. Tiến vào Ý Lâm...");
      try {
        localStorage.setItem("rememberedEmail", email);
        sessionStorage.setItem("yl.showWelcome", "1");
      } catch {}
      
      // Sử dụng router.push thay vì window.location.href để không reload trang
      if (window.location.pathname !== "/dashboard") {
        router.push("/dashboard");
      }

      // Các bước khởi tạo thực thể chạy ngầm (không chặn người dùng)
      const userId = signData.user?.id;
      if (userId) {
        supabase.from("profiles").upsert({ id: userId, encrypted_api_key: enc }, { onConflict: "id" })
          .then(({ error: profErr }) => {
            if (profErr) console.warn("Supabase profiles upsert error:", profErr);
          });

        supabase.auth.updateUser({ data: { yl_encrypted_api: enc } })
          .then(({ error: updErr }) => {
            if (updErr) console.warn("Supabase updateUser (metadata) error:", updErr);
          });

        saveApiKeyEncrypted(apiKey.trim(), password).catch(err => console.warn("saveApiKeyEncrypted error:", err));
      }
    } catch (e) {
      console.log("Register flow error:", e);
      setError(t("onboarding.cannotSaveKey"));
    } finally {
      setLoading(false);
    }
  };

  // Đăng ký - Bước 1: Xác thực Email
  const onRegisterStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError(null);
    setError(null);
    const ok = z.string().email().safeParse(email).success;
    if (!ok) {
      setEmailError(t("onboarding.emailFormatInvalid"));
      return;
    }
    setRegStep(2);
  };

  // Đăng ký - Bước 2: Kiểm chứng API Key
  const onRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeminiError(null);
    setError(null);
    setLoading(true);
    try {
      const valid = await validateGoogleStudioKey(apiKey.trim());
      if (!valid) {
        setGeminiError(t("onboarding.keyIncompatible"));
        return;
      }
      setValidatedKey(true);
      setRegStep(3);
    } finally {
      setLoading(false);
    }
  };

  // Đăng nhập
  const onLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("onboarding.invalidData"));
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error: signErr } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signErr || !data?.user) {
        setError(signErr?.message || t("onboarding.loginFailed"));
        return;
      }
      const meta = (data.user.user_metadata ?? {}) as {
        yl_encrypted_api?: { iv: string; salt: string; ciphertext: string };
      };
      const enc = meta.yl_encrypted_api;
      
      // KHAI PHÓNG: Cưỡng chế chuyển hướng bất kể API Key
      if (data.session) {
        setInfo("Đăng nhập thành công. Đang khởi tạo không gian...");
        console.log("Đăng nhập thành công. Đang khởi tạo không gian...");
        
        try {
          localStorage.setItem("rememberedEmail", email);
          sessionStorage.setItem("yl.showWelcome", "1");
        } catch {}

        // Chuyển hướng sau khi đăng nhập thành công
        // logic isLoggedIn(true) sẽ được xử lý tự động bởi onAuthStateChange trong Dashboard
        console.log("Đăng nhập thành công, chuyển sang Dashboard...");
        
        // Chỉ push router nếu không phải render trực tiếp từ Dashboard
        if (window.location.pathname !== "/dashboard") {
          router.push("/dashboard");
        }

        // Xử lý API Key chạy ngầm (không chặn điều hướng)
        if (enc?.ciphertext && enc?.iv && enc?.salt) {
          decryptString(enc.ciphertext, password, enc.iv, enc.salt)
            .then(api => saveApiKeyEncrypted(api, password))
            .catch(err => console.warn("Ý LÂM: Không thể giải mã API Key cũ.", err));
        }
      }
    } catch (err) {
      console.error("Lỗi đăng nhập:", err);
      setError(t("onboarding.cannotLogin"));
    } finally {
      setLoading(false);
    }
  };

  // Quên mật khẩu
  const onForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const parsed = forgotSchema.safeParse({ email });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? t("onboarding.emailInvalidError"));
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseBrowser();
      const redirectTo = typeof window !== "undefined" 
        ? `${window.location.origin}/onboarding/update-password` 
        : "https://y-lam.vercel.app/onboarding/update-password";
      const { error: authErr } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      if (authErr) {
        setError(authErr.message || t("onboarding.resetLinkError"));
      } else {
        setInfo(t("onboarding.resetLinkSent"));
      }
    } catch {
      setError(t("onboarding.resetLinkError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh w-full bg-[var(--background)] text-[var(--foreground)]">
      <div className="fixed right-4 top-4 z-20">
        <button
          type="button"
          onClick={() => setLocale(locale === "vi" ? "en" : "vi")}
          className={[
            "rounded-xl border border-zinc-700/60 bg-zinc-900/35 px-3 py-2",
            "text-xs text-zinc-100 backdrop-blur",
            "shadow-[0_10px_40px_rgba(0,0,0,0.35)]",
            "transition-colors hover:border-zinc-500/70 hover:bg-zinc-900/45",
          ].join(" ")}
        >
          {locale === "vi" ? "VN" : "EN"}
        </button>
      </div>
      <div className="mx-auto flex min-h-dvh max-w-lg items-center px-6">
        <main className="yl-card w-full p-6 sm:p-8">
          <header className="mb-6 text-center">
            <div className="text-xs tracking-widest text-zinc-400">{t("app.tagline")}</div>
            <h1 className="mt-1 text-2xl font-semibold animate-pulse">{t("app.name")}</h1>
            <p className="mt-1 text-sm text-zinc-400">{t("onboarding.subtitle")}</p>
          </header>
          {envError && <div className="mb-4 text-center text-sm text-red-400">{envError}</div>}

          {!saved ? (
            <>
              {mode === "register" && (
                <div className="space-y-4 text-center transition-opacity duration-300">
                  {regStep === 1 && (
                    <form onSubmit={onRegisterStep1} className="space-y-4">
                      <GlowInput
                        label={t("onboarding.email")}
                        type="email"
                        placeholder={t("onboarding.emailPlaceholder")}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                      {emailError && <div className="text-xs text-red-400">{emailError}</div>}
                      {error && <div className="text-sm text-red-400">{error}</div>}
                      <PrimaryButton disabled={loading} type="submit">
                        {loading ? t("common.loading") : t("common.continue")}
                      </PrimaryButton>
                      <div className="text-xs text-zinc-400">
                        {t("onboarding.alreadyHaveAccount")}{" "}
                        <button
                          type="button"
                          className="underline hover:text-zinc-300"
                          onClick={() => {
                            setMode("login");
                            setError(null);
                            setInfo(null);
                            setIsEmailVerified(false); // Yêu cầu check email khi quay lại login
                          }}
                        >
                          {t("onboarding.login")}
                        </button>
                      </div>
                      <p className="text-xs text-white text-center">{t("common.createdBy")}</p>
                    </form>
                  )}
                  {regStep === 2 && (
                    <form onSubmit={onRegisterStep2} className="space-y-4">
                      <GlowInput label={t("onboarding.email")} value={email} disabled />
                      <GlowInput
                        label={t("onboarding.apiKey")}
                        icon={<KeyRound size={18} />}
                        placeholder={t("onboarding.apiKeyPlaceholder")}
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <p className="text-sm text-gray-500 text-center">{t("onboarding.keyUpdateNoteVi")}</p>
                      {geminiError && <div className="text-xs text-red-400">{geminiError}</div>}
                      {error && <div className="text-sm text-red-400">{error}</div>}
                      <div className="flex items-center justify-center gap-3">
                        <PrimaryButton disabled={loading} type="submit">
                          {loading ? t("onboarding.verifyingKey") : t("onboarding.verifyKey")}
                        </PrimaryButton>
                        <button
                          type="button"
                          className="text-xs text-zinc-400 underline hover:text-zinc-300"
                          onClick={() => {
                            setRegStep(1);
                            setGeminiError(null);
                          }}
                        >
                          {t("common.back")}
                        </button>
                      </div>
                      <p className="text-xs text-white text-center">{t("common.createdBy")}</p>
                    </form>
                  )}
                  {regStep === 3 && (
                    <form onSubmit={onRegisterComplete} className="space-y-4">
                      <GlowInput label={t("onboarding.email")} value={email} disabled />
                      <GlowInput
                        label={t("onboarding.apiKey")}
                        type="password"
                        value={apiKey}
                        readOnly
                        disabled
                      />
                      <GlowInput
                        label={t("onboarding.password")}
                        icon={<ShieldCheck size={18} />}
                        type={showRegPwd ? "text" : "password"}
                        placeholder={t("onboarding.passwordMin8Special")}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        autoCorrect="off"
                        spellCheck={false}
                        trailing={
                          <button
                            type="button"
                            aria-label={showRegPwd ? t("common.hidePassword") : t("common.showPassword")}
                            onClick={() => setShowRegPwd((v) => !v)}
                            className="text-zinc-500 hover:text-zinc-200 transition-colors"
                          >
                            {showRegPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                          </button>
                        }
                      />
                      {passwordError && <div className="text-xs text-red-400">{passwordError}</div>}
                      {error && <div className="text-sm text-red-400">{error}</div>}
                      {info && <div className="text-sm text-emerald-400">{info}</div>}
                      <div className="flex items-center justify-center gap-3">
                        <PrimaryButton disabled={loading} type="submit">
                          {loading ? t("common.loading") : t("onboarding.completeRegistration")}
                        </PrimaryButton>
                        <button
                          type="button"
                          className="text-xs text-zinc-400 underline hover:text-zinc-300"
                          onClick={() => setRegStep(2)}
                        >
                          {t("common.back")}
                        </button>
                      </div>
                      <p className="text-xs text-white text-center">{t("common.createdBy")}</p>
                    </form>
                  )}
                </div>
              )}
              {mode === "login" && (
                <form onSubmit={onLogin} className="space-y-4 text-center">
                  <GlowInput
                    label={t("onboarding.email")}
                    type="email"
                    placeholder={t("onboarding.emailPlaceholder")}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsEmailVerified(false);
                    }}
                    onBlur={checkEmailExistence}
                    autoComplete="email"
                  />
                  <div className={clsx(
                    "transition-all duration-500",
                    isEmailVerified ? "opacity-100 scale-100" : "opacity-30 scale-95 pointer-events-none"
                  )}>
                    <GlowInput
                      label={t("onboarding.password")}
                      icon={<ShieldCheck size={18} />}
                      type={showLoginPwd ? "text" : "password"}
                      placeholder={t("onboarding.passwordMin8")}
                      value={password}
                      disabled={!isEmailVerified}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      autoCorrect="off"
                      spellCheck={false}
                      trailing={
                        <button
                          type="button"
                          aria-label={showLoginPwd ? t("common.hidePassword") : t("common.showPassword")}
                          onClick={() => setShowLoginPwd((v) => !v)}
                          className="text-zinc-500 hover:text-zinc-200 transition-colors"
                        >
                          {showLoginPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      }
                    />
                    {!isEmailVerified && (
                      <p className="text-[10px] text-zinc-500 mt-2 italic uppercase tracking-widest animate-pulse">
                        * Nhập email hợp lệ để mở khóa mật khẩu
                      </p>
                    )}
                  </div>
                  <button type="button" className="block text-xs text-zinc-400 underline hover:text-zinc-300" onClick={() => { setMode("forgot"); setError(null); setInfo(null); }}>
                    {t("onboarding.forgotPassword")}
                  </button>
                  {error && <div className="text-sm text-red-400">{error}</div>}
                  {info && <div className="text-sm text-emerald-400">{info}</div>}
                  <PrimaryButton disabled={loading || !isEmailVerified} type="submit">
                    {loading ? t("common.loading") : t("onboarding.login")}
                  </PrimaryButton>
                  <div className="text-xs text-zinc-400">
                    {t("onboarding.noAccount")}{" "}
                    <button type="button" className="underline hover:text-zinc-300" onClick={() => { 
                      setMode("register"); 
                      setError(null); 
                      setInfo(null);
                      setIsEmailVerified(true);
                    }}>
                      {t("onboarding.registerNow")}
                    </button>
                  </div>
                  <p className="text-xs text-white text-center">{t("common.createdBy")}</p>
                </form>
              )}
              {mode === "forgot" && (
                <form onSubmit={onForgot} className="space-y-4 text-center">
                  <GlowInput
                    label={t("onboarding.email")}
                    type="email"
                    placeholder={t("onboarding.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {error && <div className="text-sm text-red-400">{error}</div>}
                  {info && <div className="text-sm text-emerald-400">{info}</div>}
                  <PrimaryButton disabled={loading} type="submit">
                    {loading ? t("onboarding.sending") : t("onboarding.sendResetLink")}
                  </PrimaryButton>
                  <div className="text-xs text-zinc-400">
                    {t("onboarding.backToLogin")}{" "}
                    <button type="button" className="underline hover:text-zinc-300" onClick={() => { setMode("login"); setError(null); setInfo(null); }}>
                      {t("onboarding.login")}
                    </button>
                  </div>
                  <p className="text-xs text-white text-center">{t("common.createdBy")}</p>
                </form>
              )}
            </>
          ) : (
            <section className="text-center">
              <div className="mx-auto mb-3 h-10 w-10 rounded-full bg-emerald-500/20 ring-1 ring-emerald-500/40 flex items-center justify-center">
                <ShieldCheck className="text-emerald-400" size={22} />
              </div>
              <h2 className="text-lg font-medium">{t("onboarding.savedTitle")}</h2>
              <p className="mt-1 text-sm text-zinc-400">{t("onboarding.savedSubtitle")}</p>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
