"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IWord } from "@/lib/db/types/word"
import { Badge } from "@/components/ui/badge"

import { Difficulty } from "@/lib/db/types/word"

const difficultyLabel = (d: Difficulty) => {
  if (d === "easy") return { label: "Facile", variant: "success" }
  if (d === "medium") return { label: "Medio", variant: "warning" }
  return { label: "Difficile", variant: "destructive" }
}

interface WordColumnsOptions {
  locale: string
  onEdit?: (word: IWord) => void
  onDelete?: (word: IWord) => void
}

export const wordColumns = (localeOrOptions: string | WordColumnsOptions): ColumnDef<IWord>[] => {
  const locale = typeof localeOrOptions === "string" ? localeOrOptions : localeOrOptions.locale
  const onEdit = typeof localeOrOptions === "object" ? localeOrOptions.onEdit : undefined
  const onDelete = typeof localeOrOptions === "object" ? localeOrOptions.onDelete : undefined

  const cols: ColumnDef<IWord>[] = [
    {
      accessorFn: (row) => row.word[locale] ?? row.word.it ?? row.word.en,
      id: "word",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Parola <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ getValue }) => (
        <span className="font-medium">{getValue() as string}</span>
      ),
    },
    {
      accessorKey: "difficulty",
      filterFn: "difficultyRange" as any,
      sortingFn: (rowA, rowB) => {
        const order: Record<string, number> = { easy: 1, medium: 2, hard: 3 };
        const a = order[rowA.getValue("difficulty") as string] ?? 0;
        const b = order[rowB.getValue("difficulty") as string] ?? 0;
        return a - b;
      },
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Difficoltà <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const { label, variant } = difficultyLabel(row.original.difficulty)
        return <Badge variant={variant as any}>{label}</Badge>
      },
    },
  ]

  if (onEdit || onDelete) {
    cols.push({
      id: "actions",
      header: () => <span className="sr-only">Azioni</span>,
      cell: ({ row }) => (
        <div className="flex gap-1 justify-end">
          {onEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onEdit(row.original)}
              title="Modifica"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(row.original)}
              title="Elimina"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    })
  }

  return cols
}
