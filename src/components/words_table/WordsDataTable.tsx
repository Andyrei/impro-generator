"use client"

import * as React from "react"
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  getFilteredRowModel,
  ColumnFiltersState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Difficulty, IWord } from "@/lib/db/types/word";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface WordsDataTableProps {
  columns: ColumnDef<IWord, any>[]
  data: IWord[]
}

export function WordsDataTable({ columns, data }: WordsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting, columnFilters },
    initialState: { pagination: { pageSize: 50 } },
    filterFns: {
      difficultyRange: (row, columnId, filterValue) => {
        const d = row.getValue(columnId) as Difficulty;
        if (filterValue === "easy") return d === "easy";
        if (filterValue === "medium") return d === "medium";
        if (filterValue === "hard") return d === "hard";
        
        return true
      },
    },
  })

  return (
    <div className="space-y-3">
      {/* Filters row */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Cerca parola..."
          value={(table.getColumn("word")?.getFilterValue() as string) ?? ""}
          onChange={(e) => table.getColumn("word")?.setFilterValue(e.target.value)}
          className="max-w-sm placeholder:text-sm"
        />

        <Select
          value={(table.getColumn("difficulty")?.getFilterValue() as string) ?? "all"}
          onValueChange={(val) =>
            table.getColumn("difficulty")?.setFilterValue(val === "all" ? undefined : val)
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Difficoltà" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte</SelectItem>
            <SelectItem value="easy">Facile</SelectItem>
            <SelectItem value="medium">Medio</SelectItem>
            <SelectItem value="hard">Difficile</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
        <div className="h-[calc(90vh-250px)] overflow-auto rounded-md border flex-1">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-background shadow-sm text-sm">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="p-0 md:p-3">
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-md md:text-lg">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Nessuna parola trovata
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground flex-shrink-0 pt-2">
        <span>
          {table.getFilteredRowModel().rows.length} parole
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            ← Prev
          </Button>
          <span className="flex items-center px-2">
            {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  )
}
