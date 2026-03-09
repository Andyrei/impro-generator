'use client'
import { useLocale } from '@/context/LocaleContext';
import { useLongPress } from '@/hooks/useLongPress';
import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '../ui/dialog';
import { DialogClose, DialogTitle } from '@radix-ui/react-dialog';
import { WordsDataTable } from '../words_table/WordsDataTable';
import { wordColumns } from '../words_table/columns';
import { Button } from '../ui/button';

const PAGE_SIZE = 50;

type Props = {
    action: string
    actionTitle: string
    wordCount?: number
    handleShowChoosenAction: (action: string) => void
    loading: boolean, 
    setLoading: (loading: boolean) => void
    btn_type_class?: 'classic' | 'worn' | 'inset',
}

export default function ActionButton({
  action, 
  actionTitle, 
  wordCount, 
  handleShowChoosenAction, 
  loading, 
  setLoading,
  btn_type_class = "classic",
}: Props) {
  const { dictionary: intl, locale } = useLocale();
  const [openDialog, setOpenDialog] = useState(false);
  const [words, setWords] = useState<any[]>([]);
  const [tableLoading, setTableLoading] = useState(false);

  // Server-side pagination & filter state
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doFetch = useCallback(async (p: number, d: string, s: string) => {
    setTableLoading(true);
    try {
      const params = new URLSearchParams({ action, page: String(p), limit: String(PAGE_SIZE) });
      if (d !== 'all') params.set('level', d);
      if (s) params.set('search', s);
      const res = await fetch(`/api/v1/words?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      setWords(json.data ?? []);
      setTotal(json.metadata?.total ?? 0);
      setPageCount(json.metadata?.pages ?? 1);
    } catch (e) {
      console.error(e);
    }
    setTableLoading(false);
  }, [action]);

  const openTable = async () => {
    setLoading(true);
    setOpenDialog(true);
    setPage(1);
    setDifficulty('all');
    setSearch('');
    await doFetch(1, 'all', '');
    setLoading(false);
  };

  const handleDifficultyChange = (val: string) => {
    setDifficulty(val);
    setPage(1);
    doFetch(1, val, search);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      doFetch(1, difficulty, val);
    }, 400);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    doFetch(p, difficulty, search);
  };

  const handlers = useLongPress(
    openTable,
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
          {loading ? (
              <div className="flex justify-center py-8">
                <svg className="w-8 h-8 animate-spin text-green-700"/>
              </div>
            ) : (
              <WordsDataTable
                columns={wordColumns(locale.toString())}
                data={words}
                server={{
                  total,
                  page,
                  pageCount,
                  onPageChange: handlePageChange,
                  difficulty,
                  onDifficultyChange: handleDifficultyChange,
                  search,
                  onSearchChange: handleSearchChange,
                  loading: tableLoading,
                }}
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