'use client';

import { usePathname } from 'next/navigation';

export default function MarqueeBanner() {
  const pathname = usePathname();
  if (pathname === '/it' || pathname === '/en') return (<>
      {[1, 2].map((n) => (
        <div key={n} className="animate-marquee text-lg md:text-3xl font-bold text-center whitespace-nowrap">
          !!!! VERSIONE ALPHA - V0.0.6 ANCORA IN SVILUPPO !!!!
        </div>
      ))}
    </>
  );
}