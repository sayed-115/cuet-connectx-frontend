function Pagination({ page, pages, onPageChange }) {
  if (!pages || pages <= 1) return null;

  // Show max 5 page buttons with ellipsis for large page counts
  const getPageNumbers = () => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1);
    const nums = new Set([1, 2, page - 1, page, page + 1, pages - 1, pages]);
    return [...nums].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  };

  const pageNums = getPageNumbers();

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Page {page} of {pages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Prev
        </button>
        {pageNums.map((num, idx) => {
          const prev = pageNums[idx - 1];
          const showEllipsis = prev != null && num - prev > 1;
          return (
            <span key={num} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-xs text-gray-400">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(num)}
                className={`rounded-lg border px-3 py-1 text-sm ${
                  num === page
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {num}
              </button>
            </span>
          );
        })}
        <button
          type="button"
          disabled={page >= pages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default Pagination;
