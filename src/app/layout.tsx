import { Analytics } from "@vercel/analytics/react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/[lang]/globals.css";
import { LocaleProvider } from "../context/LocaleContext";
import ClientThemeProvider from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/custom-ui/Navbar";
import MarqueeBanner from "@/components/custom-ui/MarqueeBanner";
import { SessionProvider } from "next-auth/react";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const viewport: Viewport = {
    themeColor: [
        { media: '(prefers-color-scheme: dark)', color: '#000000' },
        { media: '(prefers-color-scheme: light)', color: '#991b1b' },
    ],
};

export const metadata: Metadata = {
    title: "IMPRO GENERATOR",
    description: "Generatore di divertimento",
    metadataBase: new URL('https://impro-generator.vercel.app'),
    icons: {
        icon: [{ url: '/icons/icon.png', type: 'image/png' }],
        shortcut: '/icons/icon.png',
        apple: [{ url: '/icons/icon.png' }],
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'IMPRO GENERATOR',
    },
    openGraph: {
        title: 'IMPRO GENERATOR',
        description: 'Generatore di divertimento',
        url: 'https://impro-generator.vercel.app',
        siteName: 'Ti faccio un casino!',
        images: [
        {
            url: '/og-image.png',
            width: 1200,
            height: 630,
        },
        ],
        locale: 'it_IT',
        type: 'website',
    },
}

export default async function RootLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ lang: string }>;
}) {
    const { lang } = await params;
    return (
        <html lang={lang} suppressHydrationWarning>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
                {/* Blocking script: applies dark class before first paint to prevent flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var c=localStorage.getItem('themeChoice');var dark=c==='dark'||(c!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <SessionProvider>
                <LocaleProvider initialLocale={lang}>
                    <ClientThemeProvider>
                        <div className="mx-auto max-w-screen-sm h-[100dvh] grid grid-rows-[auto_1fr_auto] overflow-hidden">
                            <header className="bg-red-800 relative flex overflow-x-hidden">
                                <MarqueeBanner />
                            </header>
                            <main className="overflow-y-auto">
                                {children}
                            </main>
                            <Navbar />
                        </div>
                    </ClientThemeProvider>
                </LocaleProvider>
                </SessionProvider>
                <Analytics />
                <Toaster />
            </body>
        </html>
    );
}
