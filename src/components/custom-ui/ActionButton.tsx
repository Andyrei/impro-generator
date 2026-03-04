'use client'
import { useLocale } from '@/context/LocaleContext';
import { useLongPress } from '@/hooks/useLongPress';
import { useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog';
import { WordsDataTable } from '../words_table/WordsDataTable';
import { wordColumns } from '../words_table/columns';
import { Button } from '../ui/button';

type Props = {
    action: string
    actionTitle: string
    wordCount?: number
    handleShowChoosenAction: (action: string) => void
    btn_type_class?: 'classic' | 'worn' | 'inset'
}

export default function ActionButton({
  action, 
  actionTitle, 
  wordCount, 
  handleShowChoosenAction, 
  btn_type_class = "classic"
}: Props) {
  const { dictionary: intl, locale } = useLocale();
  const [openDialog, setOpenDialog] = useState(false);
  const [words, setWords] = useState<any[]>([]);
  const [loadingWords, setLoadingWords] = useState(false);


  const fetchWords = async () => {
    setLoadingWords(true);
    setOpenDialog(true);
    try {
      // Fetch all difficulties (1-3 covers easy/med/hard) or use a dedicated endpoint
      const res = await fetch(`./api/v1/words?action=${action}&level=all`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setWords(data.data ?? []);
    } catch (e) {
      console.error(e);
    }
    setLoadingWords(false);
  };

  const handlers = useLongPress(
    fetchWords,
    () => handleShowChoosenAction(action),
    600
  );



  return (
    <>
      <button className={`col-span-2 row-span-2 py-6 md:py-10 nokia-btn ${btn_type_class}`} {...handlers}>
        <p className='text-sm md:text-xl btn-text glitch' data-title={actionTitle}>{actionTitle}</p>
        <div className="wear-overlay"></div>
        {wordCount !== undefined && (
          <div className="absolute bottom-0 right-0 md:bottom-2 md:right-2 text-green-200 bg-black bg-opacity-50 px-1 rounded">
           <p className='text-[0.6rem] md:text-xs'>{intl?.home?.categories.words ?? "PAROLE"}: {wordCount}</p>
          </div>
        )}
      </button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="w-[calc(100vw-2.5rem)] max-w-5xl h-[96dvh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className='text-lg md:text-3xl text-green-600 font-bold'>{actionTitle}</DialogTitle>
          </DialogHeader>
          {loadingWords ? (
              <div className="flex justify-center py-8">
                <svg className="w-8 h-8 animate-spin text-green-700"/>
              </div>
            ) : (
              <WordsDataTable
                columns={wordColumns(locale.toString())}
                data={words}
              />
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" size="default" variant="outline">
                  Close
                </Button>
              </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}