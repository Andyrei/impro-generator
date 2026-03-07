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
  suggestionCreation: SuggestionCreation;
  setSuggestionCreation: React.Dispatch<React.SetStateAction<SuggestionCreation>>;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  categories: Category[];
  locale: LocaleType;
  suggestionSubmitting: boolean;
}

export function SuggestDialog({
  suggestionDialogOpen,
  setSuggestionDialogOpen,
  suggestionCreation,
  setSuggestionCreation,
  handleSubmit,
  categories,
  locale,
  suggestionSubmitting,
}: SuggestDialogProps) {

  return (
    <Dialog open={suggestionDialogOpen} onOpenChange={setSuggestionDialogOpen}>
      <DialogContent className="sm:max-w-[425px]">
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
              <Label htmlFor="titleIT" className="text-right">
                Parola [IT]
              </Label>
              <Input
                id="titleIT"
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
              <Label htmlFor="titleEN" className="text-right">
                Parola [EN]
              </Label>
              <Input
                id="titleEN"
                placeholder="Insert word"
                value={suggestionCreation?.word?.en ?? ''}
                onChange={e =>
                  setSuggestionCreation(prev => ({
                    ...prev,
                    word: { ...prev.word, en: e.target.value },
                  }))
                }
                className="col-span-3"
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