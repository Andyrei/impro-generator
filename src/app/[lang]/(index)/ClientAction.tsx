"use client";
import { useState, useEffect, useRef } from "react";
import LevelChecker from "../../../components/custom-ui/LevelChecker";
import ActionButton from "../../../components/custom-ui/ActionButton";
import Screen from "../../../components/custom-ui/Screen";
import { ICategory } from "@/lib/db/types/category";
import { IWord } from "@/lib/db/types/word";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/context/LocaleContext";
import { Image, Pencil, Camera, Frown,} from "lucide-react";
import FabButton from "@/components/FabButton";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import Stopwatch from "@/components/custom-ui/StopWatch";
import { triggerHaptic } from "tactus";
import { useOfflineWordCache } from "@/hooks/useOfflineWordCache";
import { getOfflineWords, pickOfflineWord } from "@/lib/offlineWordCache";
import { SuggestDialog, SuggestionCreation } from "./SuggestDialog";
import { Difficulty } from "@/lib/db/types/word";


/**
 * ClientAction component is responsible for rendering the main interactive screen of the app, including:
 * - The "screen" area where the chosen word and category are displayed.
 * - Difficulty level selector (LevelChecker).
 * - Action buttons for each category.
 * - A floating action button (FAB) to open the suggestion dialog.
 * - Offline word cache management.
 * 
 */
export default function ClientAction({categories}: {categories: ICategory[]}) {
    const [showDataAction, setShowDataAction] = useState<any>();
    const [lastActions, setLastActions] = useState<Map<string, Set<string>>>(new Map());
    const [level, setLevel] = useState<Difficulty>("easy");
    const { locale } = useLocale();
    const [loadingWord, setLoadingWord] = useState(false);
    const [isOffline, setIsOffline] = useState(false);

    useOfflineWordCache(categories);

    // state for the rate limit dialog
    const [rateLimitDialog, setRateLimitDialog] = useState<{ open: boolean; countdown: number }>({ open: false, countdown: 0 });
    const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
    useEffect(() => {
        if (!rateLimitDialog.open) return;
        countdownRef.current = setInterval(() => {
            setRateLimitDialog(prev => {
                if (prev.countdown <= 1) {
                    clearInterval(countdownRef.current!);
                    return { open: false, countdown: 0 };
                }
                return { ...prev, countdown: prev.countdown - 1 };
            });
        }, 1000);
        return () => clearInterval(countdownRef.current!);
    }, [rateLimitDialog.open]);

    //  listen for online event to reset offline state
    useEffect(() => {
        const handleOnline = () => setIsOffline(false);
        window.addEventListener('online', handleOnline);
        return () => window.removeEventListener('online', handleOnline);
    }, []);

    //  initial state for the suggestion creation form  
    const [suggestionDialogOpen, setSuggestionDialogOpen] = useState(false);
    const [suggestionSubmitting, setSuggestionSubmitting] = useState(false);

    /**
     * Fetches one random word server-side via MongoDB $sample, excluding recently shown words.
     * History is tracked per category+level key and resets when all words have been seen.
     */
    const handleShowChoosenAction = async (action: string) => {
        triggerHaptic();
        setLoadingWord(true);
        setShowDataAction(undefined);

        try {
            const historyKey = `${action}__${level}`;
            const excludeSet = lastActions.get(historyKey) ?? new Set<string>();
            const excludeParam = excludeSet.size > 0
                ? `&exclude=${[...excludeSet].join(',')}`
                : '';

            let response = await fetch(
                `/api/v1/words?level=${level}&action=${action}&sample=1${excludeParam}`
            );
            if (response.status === 429) {
                const retryAfter = parseInt(response.headers.get('Retry-After') ?? '30', 10);
                setRateLimitDialog({ open: true, countdown: retryAfter });
                return;
            }
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            let data = await response.json();

            // All words for this category+level have been shown — reset history and retry
            if (!data.data?.length && excludeSet.size > 0) {
                response = await fetch(
                    `/api/v1/words?level=${level}&action=${action}&sample=1`
                );
                if (response.status === 429) {
                    const retryAfter = parseInt(response.headers.get('Retry-After') ?? '30', 10);
                    setRateLimitDialog({ open: true, countdown: retryAfter });
                    return;
                }
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                data = await response.json();
                setLastActions(prev => { const m = new Map(prev); m.delete(historyKey); return m; });
            }

            const selected: IWord | undefined = data.data?.[0];
            if (!selected) {
                toast.warning('No words available', {
                    description: 'There are no words for this category at the selected difficulty level.',
                    position: 'top-center',
                    duration: 4000,
                });
                return;
            }

            // Track this word as seen for this category+level
            if (selected._id) {
                setLastActions(prev => {
                    const m = new Map(prev);
                    const s = new Set(m.get(historyKey) ?? []);
                    s.add(String(selected._id));
                    m.set(historyKey, s);
                    return m;
                });
            }

            const category = categories.find((cat: any) => cat._id === action);
            setIsOffline(false);
            setShowDataAction({
                word: selected.word,
                category: category ? category.name : '',
                difficulty: selected.difficulty,
            });
        } catch (e) {
            console.error(e);
            // Try offline cache before showing error
            const offlineWords = await getOfflineWords(action, level);
            const historyKey = `${action}__${level}`;
            const excludeSet = lastActions.get(historyKey) ?? new Set<string>();
            const offlineWord = pickOfflineWord(offlineWords, excludeSet);
            if (offlineWord) {
                if (offlineWord._id) {
                    setLastActions(prev => {
                        const m = new Map(prev);
                        const s = new Set(m.get(historyKey) ?? []);
                        s.add(String(offlineWord._id));
                        m.set(historyKey, s);
                        return m;
                    });
                }
                const category = categories.find((cat: any) => cat._id === action);
                setShowDataAction({
                    word: offlineWord.word,
                    category: category ? category.name : '',
                    difficulty: offlineWord.difficulty,
                });
                setIsOffline(true);
            } else {
                setIsOffline(false);
                toast.error('Offline — nessuna parola in cache', {
                    description: 'Connettiti a internet almeno una volta per scaricare le parole offline.',
                    position: 'top-center',
                    duration: 5000,
                });
            }
        } finally {
            setLoadingWord(false);
        }
    };


    // SKELETON
    if (!categories){
       return(<>
        <div className="w-full h-72 relative flex justify-center items-center border border-green-800 rounded-md">
            <div className="screen_noise"></div>
            <div className="screen_overlay"></div>
            <Skeleton className="w-full" />
            <div role="status" className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <svg className="w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-green-700" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                    <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
                </svg>
            </div>
        </div>
        <div>
            <div className='h-10 relative mb-5'>
                <div className="flex h-full gap-2">
                    {Array.from({ length: 3 }, (_, index) => (
                        <Skeleton className="level" key={index}/>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-4 row-auto gap-4 m-2">
                {Array.from({ length: 4 }, (_, index) => (
                    <Skeleton className="col-span-2 row-span-2 py-20" key={index}/>
                ))}
            </div>
        </div>
        </>)
    }
    return (
        <>
            {/* Rate limit dialog */}
            <Dialog open={rateLimitDialog.open} onOpenChange={(open) => {
                if (!open) { clearInterval(countdownRef.current!); setRateLimitDialog({ open: false, countdown: 0 }); }
            }}>
                <DialogContent className="sm:max-w-xs text-center">
                    <DialogHeader className="items-center">
                        <Frown className="w-16 h-16 text-green-700 mb-2" strokeWidth={1.5} />
                        <DialogTitle className="text-xl">Rallenta! 🫠</DialogTitle>
                        <DialogDescription className="text-base">
                            Hai fatto troppe richieste di fila.<br />
                            Riprova tra{' '}
                            <span className="font-bold text-green-700">{rateLimitDialog.countdown}s</span>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="justify-center sm:justify-center">
                        <Button
                            variant="outline"
                            disabled={rateLimitDialog.countdown > 0}
                            onClick={() => { clearInterval(countdownRef.current!); setRateLimitDialog({ open: false, countdown: 0 }); }}
                        >
                            {rateLimitDialog.countdown > 0 ? `Aspetta ${rateLimitDialog.countdown}s…` : 'Riprova!'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* screen */}
            <div className="w-full bg-green-950 flex items-center justify-center relative">
                <Screen level={level} showDataAction={showDataAction} isLoading={loadingWord} isOffline={isOffline} />
            </div>

            {/* lower part */}
            <div>
                {/* difficulty levels */}
                <LevelChecker
                    className="mb-4"
                    level={level}
                    setLevel={setLevel}
                />
                <Stopwatch />
                {/* buttons */}
                <div className="grid grid-cols-4 row-auto gap-4 m-2">
                    {categories?.map((category) => (
                        <ActionButton
                            key={category._id}
                            action={category._id as string}
                            // actionTitle={category.name[locale] ? category.name[locale] : category.name.it}
                            actionTitle={category.name[locale] || category.name.it || category.name.en || 'Unknown'}
                            wordCount={category.wordCount}
                            loading={loadingWord}
                            setLoading={setLoadingWord}
                            handleShowChoosenAction={handleShowChoosenAction}
                        />
                    ))}
                </div>
            </div>

            <FabButton
                onFabClick={() => {
                    triggerHaptic();
                    setSuggestionDialogOpen(true);
                }}
            />
            <SuggestDialog
                suggestionDialogOpen={suggestionDialogOpen}
                setSuggestionDialogOpen={setSuggestionDialogOpen}
                categories={categories}
                locale={locale}
                setSuggestionSubmitting={setSuggestionSubmitting}
                suggestionSubmitting={suggestionSubmitting}
            />
        </>
    );
}
