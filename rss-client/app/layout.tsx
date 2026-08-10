import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "RSS Client — Mock LMS View", description: "Standalone RSS client for the Content Distribution Hub" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
