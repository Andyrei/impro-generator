import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocaleType } from "../getDictionary";
import { toast } from "sonner";
import { useState } from "react";
import { Difficulty } from "@/lib/db/types/word";

export type SuggestionCreation = {
  category: string;
  word: {
    [langCode: string]: string;
  };
  difficulty: Difficulty;
};

type Category = { _id: string; name: { [langCode: string]: string } };

interface SuggestDialogProps {
  suggestionDialogOpen: boolean;
  setSuggestionDialogOpen: (open: boolean) => void;
  categories: Category[];
  locale: LocaleType;
  suggestionSubmitting: boolean;
  setSuggestionSubmitting: (submitting: boolean) => void;
}

const DIFFICULTY_OPTIONS: { value: Difficulty; label: string; active: string }[] = [
  { value: "easy",   label: "Facile",    active: "bg-green-500  text-white border-green-500  shadow-green-200  shadow-md" },
  { value: "medium", label: "Medio",     active: "bg-yellow-500 text-white border-yellow-500 shadow-yellow-200 shadow-md" },
  { value: "hard",   label: "Difficile", active: "bg-red-500    text-white border-red-500    shadow-red-200    shadow-md" },
];

const EMPTY_SUGGESTION: SuggestionCreation = {
  category: "",
  word: { it: "", en: "" },
  difficulty: "easy",
};

export function SuggestDialog({
  suggestionDialogOpen,
  setSuggestionDialogOpen,
  categories,
  locale,
  suggestionSubmitting,
  setSuggestionSubmitting,
}: SuggestDialogProps) {

  const [suggestionCreation, setSuggestionCreation] = useState<SuggestionCreation>(EMPTY_SUGGESTION);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!suggestionCreation.category) {
      toast.error("Seleziona una categoria", { position: "top-center" });
      return;
    }
    if (!suggestionCreation.word.it && !suggestionCreation.word.en) {
      toast.error("Inserisci almeno una parola", { position: "top-center" });
      return;
    }

    setSuggestionSubmitting(true);
    try {
      const response = await fetch("/api/v1/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          word: suggestionCreation.word,
          category: suggestionCreation.category,
          difficulty: suggestionCreation.difficulty,
        }),
      });

      if (response.ok) {
        toast.success("Suggerimento inviato!", {
          description: "Grazie! Il tuo suggerimento verrà revisionato.",
          position: "top-center",
        });
        setSuggestionDialogOpen(false);
        setSuggestionCreation(EMPTY_SUGGESTION);
      } else {
        const err = await response.json().catch(() => ({}));
        if (response.status === 429) {
          toast.error("Limite raggiunto", { description: err.error ?? "Hai raggiunto il limite di suggerimenti.", position: "top-center" });
        } else {
          toast.error("Errore", { description: err.error ?? "Invio fallito.", position: "top-center" });
        }
      }
    } finally {
      setSuggestionSubmitting(false);
    }
  }

  return (
    <Dialog
      open={suggestionDialogOpen}
      onOpenChange={(open) => !suggestionSubmitting && setSuggestionDialogOpen(open)}
    >
      <DialogContent
        className="sm:max-w-[425px]"
        onEscapeKeyDown={(e) => suggestionSubmitting && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Aggiungi nuovo suggerimento</DialogTitle>
          <DialogDescription>
            Inserisci un nuovo suggerimento per il gioco
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* ── Categoria ── */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoria
              </Label>
                            <Select
                required
                value={suggestionCreation.category}
                onValueChange={(val) =>
                  setSuggestionCreation((prev) => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger id="category" className="col-span-3 w-full">
                  <SelectValue placeholder="Seleziona categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name[locale] || category.name.it || category.name.en || "Unknown"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* ── Parola ── */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="word" className="text-right">
                Parola
              </Label>
              <Input
                id="word"
                required
                placeholder="Inserisci la parola"
                className="col-span-3"
                value={suggestionCreation.word.it ?? ""}
                onChange={(e) =>
                  setSuggestionCreation((prev) => ({
                    ...prev,
                    word: { ...prev.word, it: e.target.value },
                  }))
                }
              />
            </div>

            {/* ── Difficoltà ── */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Difficoltà</Label>
              <div className="col-span-3 grid grid-cols-3 gap-2">
                {DIFFICULTY_OPTIONS.map(({ value, label, active }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setSuggestionCreation((prev) => ({ ...prev, difficulty: value }))
                    }
                    className={`rounded-lg border-2 py-2 text-sm font-semibold transition-all ${
                      suggestionCreation.difficulty === value
                        ? active
                        : "border-muted bg-background text-muted-foreground hover:border-foreground/30"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={suggestionSubmitting}>
              {suggestionSubmitting ? "Invio…" : "Invia suggerimento"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}