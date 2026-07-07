import { flexRender } from '@tanstack/react-table';
import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Skeleton } from './Skeleton';

export function Table({ table, loading, columns, onRowClick }) {
  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id}>
              {hg.headers.map((header) => (
                <th
                  key={header.id}
                  className={cn(
                    'text-left text-xs font-medium text-text-tertiary uppercase tracking-wider py-3 px-4 border-b border-border',
                    header.column.getCanSort() && 'cursor-pointer select-none hover:text-text-secondary'
                  )}
                  onClick={header.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getCanSort() && (
                      { asc: <ChevronUp size={14} />, desc: <ChevronDown size={14} />, false: <ChevronsUpDown size={14} className="opacity-30" /> }[header.column.getIsSorted()]
                    )}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col, j) => (
                  <td key={j} className="px-4 py-3">
                    <Skeleton className="h-4" style={{ width: `${60 + Math.random() * 30}%` }} />
                  </td>
                ))}
              </tr>
            ))
          ) : table.getRowModel().rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-12 text-text-secondary text-sm">
                No data found
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'border-b border-border/50 transition-colors hover:bg-surface-secondary/50',
                  onRowClick && 'cursor-pointer'
                )}
                onClick={() => onRowClick?.(row.original)}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3 text-sm text-text">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function Pagination({ table }) {
  const { pageIndex, pageSize } = table.getState().pagination;
  const total = table.getFilteredRowModel().rows.length;
  const pages = Math.ceil(total / pageSize);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-border">
      <span className="text-sm text-text-tertiary">
        {total > 0 ? `Showing ${pageIndex * pageSize + 1} to ${Math.min((pageIndex + 1) * pageSize, total)} of ${total}` : 'No results'}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-tertiary disabled:opacity-30 transition-colors"
        >
          Prev
        </button>
        {Array.from({ length: Math.min(pages, 5) }).map((_, i) => {
          const page = Math.max(0, Math.min(pageIndex - 2, pages - 5)) + i;
          if (page >= pages) return null;
          return (
            <button
              key={page}
              onClick={() => table.setPageIndex(page)}
              className={cn(
                'w-8 h-8 text-sm rounded-lg transition-colors',
                pageIndex === page ? 'bg-primary-600 text-white' : 'hover:bg-surface-tertiary text-text-secondary'
              )}
            >
              {page + 1}
            </button>
          );
        })}
        <button
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-surface-tertiary disabled:opacity-30 transition-colors"
        >
          Next
        </button>
      </div>
    </div>
  );
}
