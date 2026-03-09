"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { ICategory } from "@/lib/db/types/category";
import { Difficulty, IWord } from "@/lib/db/types/word";
import { WordsDataTable } from "@/components/words_table/WordsDataTable";
import { wordColumns } from "@/components/words_table/columns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, ChevronRight, Check, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { NotificationBell } from "@/components/custom-ui/NotificationBadge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Suggestion {
  _id: string;
  word: Record<string, string>;
  category: ICategory;
  difficulty: "easy" | "medium" | "hard";
  status: "pending" | "approved" | "rejected";
  suggestedBy?: { name?: string; email?: string };
  createdAt: string;
}

interface AdminDashboardProps {
  categories: ICategory[];
}

// ─── Edit Dialog ─────────────────────────────────────────────────────────────

function EditWordDialog({
  word,
  categories,
  onClose,
  onSaved,
}: {
  word: IWord;
  categories: ICategory[];
  onClose: () => void;
  onSaved: (updated: IWord) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [fields, setFields] = useState({
    it: (word.word as any).it ?? "",
    en: (word.word as any).en ?? "",
    ro: (word.word as any).ro ?? "",
    difficulty: String(word.difficulty) as Difficulty,
    category: String(word.category),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      const wordMap: Record<string, string> = {};
      if (fields.it) wordMap.it = fields.it;
      if (fields.en) wordMap.en = fields.en;
      if (fields.ro) wordMap.ro = fields.ro;

      const res = await fetch(`/api/v1/words/${(word as any)._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: wordMap,
          difficulty: fields.difficulty,
          category: fields.category,
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      const { data } = await res.json();
      toast.success("Parola aggiornata");
      onSaved(data);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica parola</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3 py-2">
          {(["it", "en", "ro"] as const).map((lang) => (
            <div key={lang} className="grid grid-cols-4 items-center gap-3">
              <Label className="text-right uppercase text-xs">{lang}</Label>
              <Input
                className="col-span-3"
                value={fields[lang]}
                onChange={(e) => setFields((p) => ({ ...p, [lang]: e.target.value }))}
              />
            </div>
          ))}
          <div className="grid grid-cols-4 items-center gap-3">
            <Label className="text-right text-xs">Difficoltà</Label>
            <Select
              value={fields.difficulty}
              onValueChange={(v: Difficulty) => setFields((p) => ({ ...p, difficulty: v }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Facile</SelectItem>
                <SelectItem value="medium">Medio</SelectItem>
                <SelectItem value="hard">Difficile</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-3">
            <Label className="text-right text-xs">Categoria</Label>
            <Select
              value={fields.category}
              onValueChange={(v: string) => setFields((p) => ({ ...p, category: v }))}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name.it ?? c.name.en ?? c._id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salva
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteWordDialog({
  word,
  onClose,
  onDeleted,
}: {
  word: IWord;
  onClose: () => void;
  onDeleted: (id: string) => void;
}) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/v1/words/${(word as any)._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      toast.success("Parola eliminata");
      onDeleted(String((word as any)._id));
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  };

  const label =
    (word.word as any).it ?? (word.word as any).en ?? String((word as any)._id);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Elimina "{label}"?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Questa azione è irreversibile.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Elimina
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Category Accordion Section ───────────────────────────────────────────────

const PAGE_SIZE = 50;

function CategorySection({
  category,
  categories,
}: {
  category: ICategory;
  categories: ICategory[];
}) {
  const [open, setOpen] = useState(false);
  const [words, setWords] = useState<IWord[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [editTarget, setEditTarget] = useState<IWord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<IWord | null>(null);
  const [tableLoading, setTableLoading] = useState(false);

  // Server-side pagination & filter state
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState(1);
  const [total, setTotal] = useState(0);
  const [difficulty, setDifficulty] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('word.it');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doFetch = useCallback(async (p: number, d: string, s: string, so = 'word.it', sd: 'asc' | 'desc' = 'asc', initial = false) => {
    initial ? setLoading(true) : setTableLoading(true);
    try {
      const params = new URLSearchParams({ action: category._id, page: String(p), limit: String(PAGE_SIZE) });
      if (d !== 'all') params.set('level', d);
      if (s) params.set('search', s);
      params.set('sort', so);
      params.set('sortDir', sd);
      const res = await fetch(`/api/v1/words?${params}`);
      const json = await res.json();
      const raw: any[] = json.data ?? [];
      const mapped: IWord[] = raw.map((w) => ({
        ...w,
        word: w.word instanceof Map ? Object.fromEntries(w.word) : w.word,
      }));
      setWords(mapped);
      setTotal(json.metadata?.total ?? 0);
      setPageCount(json.metadata?.pages ?? 1);
      setFetched(true);
    } catch {
      toast.error('Errore nel caricamento delle parole');
    } finally {
      initial ? setLoading(false) : setTableLoading(false);
    }
  }, [category._id]);

  const handleToggle = () => {
    setOpen((o) => {
      if (!o && !fetched) doFetch(1, 'all', '', 'word.it', 'asc', true);
      return !o;
    });
  };

  const handleDifficultyChange = (val: string) => {
    setDifficulty(val);
    setPage(1);
    doFetch(1, val, search, sort, sortDir);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setPage(1);
      doFetch(1, difficulty, val, sort, sortDir);
    }, 400);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
    doFetch(p, difficulty, search, sort, sortDir);
  };

  const handleSortChange = (so: string, sd: 'asc' | 'desc') => {
    setSort(so);
    setSortDir(sd);
    setPage(1);
    doFetch(1, difficulty, search, so, sd);
  };

  const columns = wordColumns({
    locale: 'it',
    onEdit: setEditTarget,
    onDelete: setDeleteTarget,
  });

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
        onClick={handleToggle}
      >
        <div className="flex items-center gap-3">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          <span className="font-semibold">
            {category.name.it ?? category.name.en ?? category._id}
          </span>
          <Badge variant="secondary">{category.wordCount ?? "?"} parole</Badge>
        </div>
        {loading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </button>

      {/* Body */}
      {open && (
        <div className="border-t px-4 py-4">
          {loading && !fetched ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <WordsDataTable
              columns={columns}
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
                sort,
                sortDir,
                onSortChange: handleSortChange,
                loading: tableLoading,
              }}
            />
          )}
        </div>
      )}

      {/* Dialogs */}
      {editTarget && (
        <EditWordDialog
          word={editTarget}
          categories={categories}
          onClose={() => setEditTarget(null)}
          onSaved={(updated) => {
            setWords((prev) =>
              prev.map((w) => (String((w as any)._id) === String((updated as any)._id) ? updated : w))
            );
            setEditTarget(null);
            doFetch(page, difficulty, search, sort, sortDir);
          }}
        />
      )}
      {deleteTarget && (
        <DeleteWordDialog
          word={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(id) => {
            setWords((prev) => prev.filter((w) => String((w as any)._id) !== id));
            setDeleteTarget(null);
            doFetch(page, difficulty, search, sort, sortDir);
          }}
        />
      )}
    </div>
  );
}

// ─── Suggestions Panel ────────────────────────────────────────────────────────

function SuggestionsPanel() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/suggestions?status=pending")
      .then(async (r) => {
        if (!r.ok) {
          const err = await r.json().catch(() => ({}));
          throw new Error(err.error ?? `HTTP ${r.status}`);
        }
        return r.json();
      })
      .then((d) => setSuggestions(d.data ?? []))
      .catch((e) => setFetchError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (id: string, status: "approved" | "rejected") => {
    setActing(id);
    try {
      const res = await fetch(`/api/v1/suggestions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Errore");
      setSuggestions((prev) => prev.filter((s) => s._id !== id));
      toast.success(status === "approved" ? "Approvato e aggiunto" : "Rifiutato");
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActing(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <p className="text-center text-destructive py-12">
        Errore: {fetchError}
      </p>
    );
  }

  if (suggestions.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">
        Nessun suggerimento in attesa.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {suggestions.map((s) => (
        <div key={s._id} className="border rounded-lg p-4 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-2">
              {Object.entries(s.word).map(([lang, val]) => (
                <Badge key={lang} variant="outline">
                  <span className="uppercase text-xs mr-1">{lang}</span> {val}
                </Badge>
              ))}
            </div>
            <div className="flex gap-2 text-xs text-muted-foreground">
              <span>Categoria: {(s.category?.name?.it ?? s.category?.name?.en) ?? s.category?._id}</span>
              <span>·</span>
              <span>Difficoltà: {s.difficulty === "easy" ? "Facile" : s.difficulty === "medium" ? "Medio" : "Difficile"}</span>
              {s.suggestedBy && (
                <>
                  <span>·</span>
                  <span>Da: {s.suggestedBy.name ?? s.suggestedBy.email}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              size="icon"
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
              disabled={acting === s._id}
              onClick={() => handleAction(s._id, "approved")}
              title="Approva"
            >
              {acting === s._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
            <Button
              size="icon"
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive/10"
              disabled={acting === s._id}
              onClick={() => handleAction(s._id, "rejected")}
              title="Rifiuta"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

type Tab = "words" | "suggestions";

export default function AdminDashboard({ categories }: AdminDashboardProps) {
  const [tab, setTab] = useState<Tab>("words");
  const [suggestionCount, setSuggestionCount] = useState(0);

  useEffect(() => {
    fetch("/api/v1/suggestions?status=pending")
      .then((r) => r.ok ? r.json() : { data: [] })
      .then((d) => setSuggestionCount((d.data ?? []).length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "suggestions") setTab("suggestions");
  }, []);

  const switchTab = (t: Tab) => {
    setTab(t);
    window.location.hash = t;
  };

  return (<>
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 border-b">
        {(["words", "suggestions"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => switchTab(t)}
            className={`relative px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === t
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            {t === "words" ? "Parole" : "Suggerimenti"}
            {t === "suggestions" && suggestionCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 rounded-full text-[10px]"
              >
                {suggestionCount}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Words tab — accordion per category */}
      {tab === "words" && (
        <div className="space-y-3">
          {categories.map((cat) => (
            <CategorySection key={cat._id} category={cat} categories={categories} />
          ))}
        </div>
      )}

      {/* Suggestions tab */}
      {tab === "suggestions" && <SuggestionsPanel />}
    </div>
    

  </>);
}
