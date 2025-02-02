import ClientAction from '@/ui/ClientAction';
import Navbar from '../ui/Navbar';

export default function Home() {
  return (
    <>
    <div className="mx-auto max-w-screen-sm min-h-[100dvh] grid grid-rows-[auto_1fr_auto]">
      <header className="bg-red-800 relative flex overflow-x-hidden">
        <div className="animate-marquee text-3xl font-bold text-center whitespace-nowrap">
          !!!! VERSIONE ALPHA - V0.0.2 ANCORA IN SVILUPPO !!!!
        </div>
        <div className="absolute top-0 animate-marquee2 text-3xl font-bold text-center whitespace-nowrap">
          !!!! VERSIONE ALPHA - V0.0.2 ANCORA IN SVILUPPO !!!!
        </div>
      </header>
      
      <main className="">
       <ClientAction />
      </main>

      <Navbar />
    </div>
  </>);
}
