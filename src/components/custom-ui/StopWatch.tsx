// Simplified logic for a Shadcn-styled stopwatch
import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Pause, Play, RotateCcw } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { triggerHaptic } from "tactus";

export default function Stopwatch() {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const { themeSettings } = useTheme();
    const wakeLockRef = useRef<WakeLockSentinel | null>(null);

    useEffect(() => {
        const acquireWakeLock = async () => {
            if ('wakeLock' in navigator) {
                try {
                    wakeLockRef.current = await navigator.wakeLock.request('screen');
                } catch {
                    // Wake lock request may fail (e.g. low battery), silently ignore
                }
            }
        };

        const releaseWakeLock = async () => {
            if (wakeLockRef.current) {
                await wakeLockRef.current.release();
                wakeLockRef.current = null;
            }
        };

        if (isRunning) {
            acquireWakeLock();
        } else {
            releaseWakeLock();
        }

        return () => { releaseWakeLock(); };
    }, [isRunning]);

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRunning) {
            const startTime = Date.now() - time;
            interval = setInterval(() => setTime(Date.now() - startTime), 10);
        }
        return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isRunning]);

    // Format time (mm:ss:ms)
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60000);
        const seconds = Math.floor((time % 60000) / 1000);
        const milliseconds = Math.floor((time % 1000) / 10);

        
        switch (themeSettings.stopwatchTimeFormat) {
            case "mm:ss":
                return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            case "ss:ms":
                return `${String(seconds + minutes * 60).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
            case "mm:ss:ms":
            default:
                return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(milliseconds).padStart(2, '0')}`;
        }
    };

    return (
        <div className="py-4 px-3 flex justify-between">
            <Button className='text-white' onClick={() => {
                triggerHaptic()
                setIsRunning(!isRunning)
            }}>
                {isRunning ? <Pause /> : <Play />}
            </Button>
            <div className="text-4xl font-mono" onClick={()=>{
                if(time) {
                    triggerHaptic();
                    setIsRunning(!isRunning);
                }
            }}>{formatTime(time)}</div>
            <Button className='text-white' onClick={() => { triggerHaptic(); setIsRunning(false); setTime(0); }}>
                <RotateCcw />
            </Button>
        </div>
    );
}
