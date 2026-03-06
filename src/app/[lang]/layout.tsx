import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/[lang]/globals.css";
import { LocaleProvider } from "../../context/LocaleContext";
import ClientThemeProvider from "@/context/ThemeContext";
import { Toaster } from "@/components/ui/sonner";
import Navbar from "@/components/custom-ui/Navbar";

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
    description: "Generatore di divertimento",
    metadataBase: new URL('https://impro-generator.vercel.app'),
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
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                {/* Blocking script: applies dark class before first paint to prevent flash */}
                <script
                    dangerouslySetInnerHTML={{
                        __html: `(function(){try{var c=localStorage.getItem('themeChoice');var dark=c==='dark'||(c!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(dark)document.documentElement.classList.add('dark');else document.documentElement.classList.remove('dark');}catch(e){}})();`,
                    }}
                />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <LocaleProvider initialLocale={lang}>
                    <ClientThemeProvider>
                        <div className="mx-auto max-w-screen-sm min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
                            <header className="bg-red-800 relative flex overflow-x-hidden">
                                {
                                    [1,2].map((n)=>(
                                        <div key={n} className="animate-marquee text-lg md:text-3xl  font-bold text-center whitespace-nowrap">
                                            !!!! VERSIONE ALPHA - V0.0.6 ANCORA IN SVILUPPO!!!!
                                        </div>
                                    ))
                                }
                            </header>
                            <main>
                                {children}
                            </main>
                            <Navbar />
                        </div>
                    </ClientThemeProvider>
                </LocaleProvider>
                <Analytics />
                <Toaster />
            </body>
        </html>
    );
}
