import Link from 'next/link'

type Props = {
  currentPage: number
  totalPages: number
}

function pageWindow(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages])
  for (let page = currentPage - 2; page <= currentPage + 2; page++) {
    if (page >= 1 && page <= totalPages) pages.add(page)
  }
  return [...pages].sort((a, b) => a - b)
}

export default function VideoPagination({ currentPage, totalPages }: Props) {
  if (totalPages <= 1) return null
  const pages = pageWindow(currentPage, totalPages)
  const href = (page: number) => page === 1 ? '?' : `?page=${page}`

  return (
    <nav className="archive-pagination" aria-label="Archive pages">
      <div className="archive-pagination-pages">
        {currentPage > 1 ? <Link href={href(currentPage - 1)} aria-label="Previous page">‹</Link> : <span className="is-disabled">‹</span>}
        {pages.map((page, index) => (
          <span key={page} className="archive-pagination-group">
            {index > 0 && page - pages[index - 1] > 1 && <span className="archive-pagination-ellipsis">…</span>}
            <Link href={href(page)} className={page === currentPage ? 'is-current' : undefined} aria-current={page === currentPage ? 'page' : undefined}>
              {page}
            </Link>
          </span>
        ))}
        {currentPage < totalPages ? <Link href={href(currentPage + 1)} aria-label="Next page">›</Link> : <span className="is-disabled">›</span>}
      </div>
      {currentPage < totalPages && (
        <Link className="archive-pagination-more" href={href(currentPage + 1)}>
          더보기 · Show more
        </Link>
      )}
    </nav>
  )
}
