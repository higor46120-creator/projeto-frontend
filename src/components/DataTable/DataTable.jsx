import React from 'react';

/**
 * DataTable genérico e reutilizável, estilizado com TailwindCSS.
 * Não conhece nenhum service específico — recebe os dados já prontos e
 * dispara callbacks (onSortChange, onPageChange...) para quem o utiliza
 * decidir como buscar os dados (ex: productService.searchProducts).
 */
export default function DataTable({
  columns = [],
  data = [],
  rowKey = 'id',
  loading = false,
  error = null,
  onRetry,
  sortBy,
  sortOrder = 'ASC',
  onSortChange,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
  emptyMessage = 'Nenhum registro encontrado.',
}) {
  const colSpan = columns.length || 1;

  const handleHeaderClick = (column) => {
    if (!column.sortable || !onSortChange) return;
    onSortChange(column.key);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex justify-between items-center">
          <span>{error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-xs font-semibold underline hover:text-red-900"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/75 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                {columns.map((column) => (
                  <th
                    key={column.key}
                    onClick={() => handleHeaderClick(column)}
                    className={[
                      'py-3.5 px-4',
                      column.align === 'right' ? 'text-right' : '',
                      column.sortable ? 'cursor-pointer select-none hover:text-indigo-600 transition' : '',
                    ].join(' ')}
                  >
                    <div className={`flex items-center gap-1 ${column.align === 'right' ? 'justify-end' : ''}`}>
                      <span>{column.header}</span>
                      {column.sortable && sortBy === column.key && (
                        <span>{sortOrder === 'ASC' ? '▲' : '▼'}</span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={colSpan} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span>Carregando...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={colSpan} className="py-12 text-center text-slate-500">
                    {emptyMessage}
                  </td>
                </tr>
              ) : (
                data.map((row) => (
                  <tr key={row[rowKey]} className="hover:bg-slate-50/80 transition">
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={[
                          'py-3 px-4',
                          column.align === 'right' ? 'text-right' : '',
                          column.cellClassName || '',
                        ].join(' ')}
                      >
                        {column.render ? column.render(row) : row[column.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(onPageChange || onPageSizeChange) && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-5 py-4 border-t border-slate-200 bg-slate-50/50">
            {onPageSizeChange ? (
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span>Itens por página:</span>
                <select
                  value={pageSize}
                  onChange={(e) => onPageSizeChange(Number(e.target.value))}
                  className="rounded border border-slate-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {pageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-600">
                Página <span className="font-semibold">{totalPages > 0 ? currentPage + 1 : 0}</span> de{' '}
                <span className="font-semibold">{totalPages}</span>
                {' · '}
                <span className="font-semibold">{totalElements}</span> itens
              </span>

              {onPageChange && (
                <div className="inline-flex rounded-md shadow-sm">
                  <button
                    onClick={() => onPageChange(Math.max(currentPage - 1, 0))}
                    disabled={currentPage === 0 || loading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-l-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => onPageChange(Math.min(currentPage + 1, Math.max(totalPages - 1, 0)))}
                    disabled={currentPage >= totalPages - 1 || loading}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border-t border-b border-r border-slate-300 rounded-r-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
