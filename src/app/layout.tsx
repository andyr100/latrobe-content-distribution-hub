import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { appConfig } from "@/config/app";
import { AppShell } from "@/components/layout/AppShell";
import { PreferencesProvider } from "@/context/PreferencesContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: appConfig.name,
    template: `%s · ${appConfig.name}`,
  },
  description:
    "A frontend prototype for publishing university content to subject RSS channels.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=JSON.parse(localStorage.getItem('lt-content-hub.preferences.v1')||'{}');var t=p.theme==='system'||!p.theme?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):p.theme;document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='light'}})()`,
          }}
        />
      </head>
      <body>
        <a
          href="#main-content"
          className="fixed left-4 top-3 z-[100] -translate-y-20 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-bold text-white focus:translate-y-0"
        >
          Skip to main content
        </a>
        <PreferencesProvider><AppShell>{children}</AppShell></PreferencesProvider>
      </body>
    </html>
  );
}
