import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LocaleProvider } from '../../context/LocaleContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "IMPRO GENERATOR",
  description: "Suggestion generator tool for improv scenes",
};

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode,
  params: { lang: 'en' | 'it' | 'ro' }
}) {
  const { lang } = await params;
  return (
    <html lang={lang}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}>
        <LocaleProvider initialLocale={lang}>
          {children}
        </LocaleProvider>
        <Analytics />
      </body>
    </html>
  )
}
