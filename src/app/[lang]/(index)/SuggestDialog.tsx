import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { LocaleType } from "../getDictionary";
import { toast } from "sonner";
import { useState } from "react";

export type SuggestionCreation = {
  category: string;
  word: {
    [langCode: string]: string;
  };
  difficulty: number;
};

type Category = { _id: string; name: { [langCode: string]: string } };

interface SuggestDialogProps {
  suggestionDialogOpen: boolean;
  setSuggestionDialogOpen: (open: boolean) => void;
  categories: Category[];
  locale: LocaleType;
  suggestionSubmitting: boolean;
  setSuggestionSubmitting: (submitting: boolean) => void;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function SuggestDialog({
  suggestionDialogOpen,
  setSuggestionDialogOpen,
  categories,
  locale,
  suggestionSubmitting,
  setSuggestionSubmitting,
  handleSubmit,
}: SuggestDialogProps) {

  const [suggestionCreation, setSuggestionCreation] = useState<SuggestionCreation>({
        category: "",
        word: { it: "" },
        difficulty: 1
  });

  if (!handleSubmit) {
      handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault();
        if (!suggestionCreation.category) {
            toast.error('Seleziona una categoria', { position: 'top-center' });
            return;
        }
        if (!suggestionCreation.word.it && !suggestionCreation.word.en) {
            toast.error('Inserisci almeno una parola', { position: 'top-center' });
            return;
        }

        setSuggestionSubmitting(true);
        try {
            const response = await fetch('/api/v1/suggestions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    word: suggestionCreation.word,
                    category: suggestionCreation.category,
                    difficulty: suggestionCreation.difficulty,
                }),
            });

            if (response.ok) {
                toast.success('Suggerimento inviato!', {
                    description: 'Grazie! Il tuo suggerimento verrà revisionato.',
                    position: 'top-center',
                });
                setSuggestionDialogOpen(false);
                setSuggestionCreation({ category: "", word: { it: "", en: "" }, difficulty: 1 });
            } else {
                const err = await response.json().catch(() => ({}));
                if (response.status === 429) {
                    toast.error('Limite raggiunto', { description: err.error ?? 'Hai raggiunto il limite di suggerimenti.', position: 'top-center' });
                } else {
                    toast.error('Errore', { description: err.error ?? 'Invio fallito.', position: 'top-center' });
                }
            }
        } finally {
            setSuggestionSubmitting(false);
        }
    };
  }

  return (
    <Dialog modal={false} open={suggestionDialogOpen} onOpenChange={(open) => !suggestionSubmitting && setSuggestionDialogOpen(open)}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => suggestionSubmitting && e.preventDefault()}
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Categoria
              </Label>
              <Select
                required
                value={suggestionCreation.category}
                onValueChange={(val: string) =>
                  setSuggestionCreation(prev => ({ ...prev, category: val }))
                }
              >
                <SelectTrigger className="col-span-3 w-full max-w-48">
                  <SelectValue placeholder="Select an action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {categories.map((category: Category) => (
                      <SelectItem
                        key={category._id}
                        value={category._id as string}
                      >
                        {category.name[locale] || category.name.it || category.name.en || 'Unknown'}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="word" className="text-right">
                Parola
              </Label>
              <Input
                id="word"
                required
                placeholder="Inserisci la parola"
                className="col-span-3"
                value={suggestionCreation?.word?.it ?? ''}
                onChange={e =>
                  setSuggestionCreation(prev => ({
                    ...prev,
                    word: { ...prev.word, it: e.target.value },
                  }))
                }
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="difficulty" className="text-right">
                Difficoltà {suggestionCreation.difficulty}
              </Label>
              <Slider
                id="difficulty"
                className="col-span-3"
                value={[suggestionCreation.difficulty]}
                onValueChange={val =>
                  setSuggestionCreation(prev => ({ ...prev, difficulty: val[0] }))
                }
                min={1}
                max={100}
                step={1}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={suggestionSubmitting}>
              {suggestionSubmitting ? 'Invio…' : 'Invia suggerimento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}