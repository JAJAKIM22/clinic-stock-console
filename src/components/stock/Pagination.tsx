import { Button } from "@/components/ui/button";

const PAGE_SIZE = 10;

export function Pagination({
  page,
  total,
  onPageChange,
}: {
  page: number;
  total: number;
  onPageChange: (page: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  if (totalPages <= 1) return null;

  // Keep the page list short: current page, one neighbour each side, and
  // the first/last page — with ellipses for the gaps. Fine for ~20 pages
  // (194 items / 10 per page), no need for anything fancier.
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pageNumbers.filter(
    (n) => n === 1 || n === totalPages || Math.abs(n - page) <= 1,
  );

  return (
    <nav
      aria-label="Stock list pagination"
      className="flex items-center justify-end gap-1"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        Previous
      </Button>

      {visible.map((n, i) => {
        const prev = visible[i - 1];
        const showEllipsis = prev !== undefined && n - prev > 1;
        return (
          <span key={n} className="flex items-center gap-1">
            {showEllipsis && <span className="px-1">…</span>}
            <Button
              variant={n === page ? "default" : "outline"}
              size="sm"
              aria-current={n === page ? "page" : undefined}
              onClick={() => onPageChange(n)}
            >
              {n}
            </Button>
          </span>
        );
      })}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
      >
        Next
      </Button>
    </nav>
  );
}
