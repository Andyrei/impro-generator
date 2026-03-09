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
  PaginationState,
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
import { IWord } from "@/lib/db/types/word";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface ServerProps {
  total: number
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  difficulty: string
  onDifficultyChange: (val: string) => void
  search: string
  onSearchChange: (val: string) => void
  sort: string
  sortDir: 'asc' | 'desc'
  onSortChange: (sort: string, sortDir: 'asc' | 'desc') => void
  loading?: boolean
}

interface WordsDataTableProps {
  columns: ColumnDef<IWord, any>[]
  data: IWord[]
  server?: ServerProps
}

export function WordsDataTable({ columns, data, server }: WordsDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({ pageIndex: 0, pageSize: 50 })

  const activePagination = server
    ? { pageIndex: server.page - 1, pageSize: 50 }
    : pagination

  const activeSorting: SortingState = server
    ? (server.sort ? [{ id: server.sort === 'word.it' ? 'word' : 'difficulty', desc: server.sortDir === 'desc' }] : [])
    : sorting

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: server
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(activeSorting) : updater;
          if (next.length === 0) return;
          const col = next[0];
          const apiField = col.id === 'difficulty' ? 'difficulty' : 'word.it';
          server.onSortChange(apiField, col.desc ? 'desc' : 'asc');
        }
      : setSorting,
    onColumnFiltersChange: setColumnFilters,
    state: { sorting: activeSorting, columnFilters, pagination: activePagination },
    manualPagination: !!server,
    manualFiltering: !!server,
    manualSorting: !!server,
    pageCount: server?.pageCount,
    onPaginationChange: server
      ? (updater) => {
          const next = typeof updater === 'function' ? updater(activePagination) : updater;
          server.onPageChange(next.pageIndex + 1);
        }
      : setPagination,
    filterFns: {
      difficultyRange: (row, columnId, filterValue) => {
        const d = row.getValue(columnId) as any;
        // Handle both string ('easy'/'medium'/'hard') and legacy numeric values
        if (typeof d === 'string') return d === filterValue;
        if (filterValue === 'easy')   return d <= 33;
        if (filterValue === 'medium') return d > 33 && d <= 66;
        return d > 66;
      },
    },
  })

  const searchVal = server
    ? server.search
    : ((table.getColumn("word")?.getFilterValue() as string) ?? "")

  const difficultyVal = server
    ? server.difficulty
    : ((table.getColumn("difficulty")?.getFilterValue() as string) ?? "all")

  const handleSearchChange = (val: string) => {
    if (server) server.onSearchChange(val)
    else table.getColumn("word")?.setFilterValue(val)
  }

  const handleDifficultyChange = (val: string) => {
    if (server) server.onDifficultyChange(val)
    else table.getColumn("difficulty")?.setFilterValue(val === "all" ? undefined : val)
  }

  const totalLabel  = server ? server.total    : table.getFilteredRowModel().rows.length
  const canPrev     = server ? server.page > 1 : table.getCanPreviousPage()
  const canNext     = server ? server.page < server.pageCount : table.getCanNextPage()
  const currentPage = server ? server.page     : table.getState().pagination.pageIndex + 1
  const totalPages  = server ? server.pageCount : table.getPageCount()

  return (
    <div className="space-y-3">
      {/* Filters row */}
      <div className="flex gap-3 items-center">
        <Input
          placeholder="Cerca parola..."
          value={searchVal}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm placeholder:text-sm"
        />

        <Select value={difficultyVal} onValueChange={handleDifficultyChange}>
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
            {server?.loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  Caricamento…
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
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
          {totalLabel} parole
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => server ? server.onPageChange(server.page - 1) : table.previousPage()}
            disabled={!canPrev}
          >
            ← Prev
          </Button>
          <span className="flex items-center px-2">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => server ? server.onPageChange(server.page + 1) : table.nextPage()}
            disabled={!canNext}
          >
            Next →
          </Button>
        </div>
      </div>
    </div>
  )
}
