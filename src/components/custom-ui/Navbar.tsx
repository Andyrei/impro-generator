"use client";
import {
    Home,
    Search,
    Bell,
    User,
    Image,
    Settings,
} from "lucide-react";
import Link from "next/link";
import { useLocale } from "@/context/LocaleContext";
import { useTheme } from '@/context/ThemeContext';
import { triggerHaptic } from "tactus";


const Navbar = () => {
    const { isLoading } = useTheme();

    const { locale } = useLocale()

    // const fabFunc = () => setOpen(!open);
    

    const navigation = [
        { 
            icon: Home, 
            label: "Home", 
            href: `/${locale}`, 
            position: "left", 
            order: 0 
        },
        {
            icon: Settings,
            label: "Settings",
            href: `/${locale}/settings`,
            position: "right",
            order: 1,
        },
        // { icon: Search, label: 'Search', href: '/search', position: 'left', order: 1 },
        // { icon: User, label: 'Profile', href: '/profile', position: 'right', order: 0 },
    ];

    return (
        <>
            <div>
                {/* Main navigation bar */}
                <nav className="bg-black border-t border-green-900 h-16 flex items-center justify-around px-4 relative">
                    <div className="flex w-1/2 justify-around">
                        {navigation
                            .filter((item) => item.position === "left")
                            .sort((a, b) => a.order - b.order)
                            .map((item, index) => (
                                <Link
                                    key={index}
                                    className="flex flex-col items-center gap-1 p-2 hover:text-green-400 text-green-600 transition-colors"
                                    href={item.href}
                                    onClick={()=>{triggerHaptic()}}>
                                    <item.icon size={22} strokeWidth={1.5} />
                                    <span className="font-mono text-[9px] uppercase tracking-widest">{item.label}</span>
                                </Link>
                            ))}
                    </div>

                    <div className="w-16" />

                    <div className="flex w-1/2 justify-around">
                        {navigation
                            .filter((item) => item.position === "right")
                            .sort((a, b) => a.order - b.order)
                            .map((item, index) => (
                                <Link
                                    key={index}
                                    className="flex flex-col items-center gap-1 p-2 hover:text-green-400 text-green-600 transition-colors"
                                    href={item.href}
                                    onClick={()=>{triggerHaptic()}}>
                                    <item.icon size={22} strokeWidth={1.5} />
                                    <span className="font-mono text-[9px] uppercase tracking-widest">{item.label}</span>
                                </Link>
                            ))}
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Navbar;
