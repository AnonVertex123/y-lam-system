import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { I18nProvider, type Locale } from "@/components/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ý Lâm • Personal Intelligence OS",
  description: "Hệ điều hành Trí tuệ Cá nhân & Di sản Tri thức",
};

async function detectLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get("yl_locale")?.value;
  if (cookieLocale === "vi" || cookieLocale === "en") return cookieLocale;
  const h = await headers();
  const al = h.get("accept-language") ?? "";
  const lower = al.toLowerCase();
  if (lower.includes("vi")) return "vi";
  return "en";
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialLocale = await detectLocale();
  return (
    <html lang={initialLocale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider initialLocale={initialLocale}>{children}</I18nProvider>
      </body>
    </html>
  );
}
