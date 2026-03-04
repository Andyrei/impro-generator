"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { IWord } from "@/lib/db/types/word"
import { Badge } from "@/components/ui/badge"

const difficultyLabel = (d: number) => {
  if (d <= 33) return { label: `${d} - Facile`, variant: "success" }
  if (d <= 66) return { label: `${d} - Medio`, variant: "warning" }
  return { label: `${d} - Difficile`, variant: "destructive" }
}

export const wordColumns = (locale: string): ColumnDef<IWord>[] => [
  // {
  //   id: "index",
  //   header: () => <p className="text-muted-foreground">#</p>,
  //   cell: ({ row, table }) => {
  //     const pageIndex = table.getState().pagination.pageIndex
  //     const pageSize = table.getState().pagination.pageSize
  //     return (
  //       <span className="text-muted-foreground text-xs">
  //         {pageIndex * pageSize + row.index + 1}
  //       </span>
  //     )
  //   },
  // },
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
    filterFn: "difficultyRange" as any,  // 👈 add this line
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
