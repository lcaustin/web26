import Link from 'next/link'

type Props = {
  currentPage: number
  totalPages: number
  basePath?: string
  mobileHidden?: boolean
}

function pageWindow(currentPage: number, totalPages: number) {
  const pages = new Set([1, totalPages])
  for (let page = currentPage - 2; page <= currentPage + 2; page++) {
    if (page >= 1 && page <= totalPages) pages.add(page)
  }
  return [...pages].sort((a, b) => a - b)
}

export default function VideoPagination({ currentPage, totalPages, basePath = '', mobileHidden = false }: Props) {
  if (totalPages <= 1) return null
  const pages = pageWindow(currentPage, totalPages)
  const href = (page: number) => {
    const [path = '', queryString = ''] = basePath.split('?')
    const params = new URLSearchParams(queryString)
    if (page === 1) params.delete('page')
    else params.set('page', String(page))
    const query = params.toString()
    return `${path}${query ? `?${query}` : ''}` || '?'
  }

  return (
    <nav className={`archive-pagination${mobileHidden ? ' archive-pagination--mobile-hidden' : ''}`} aria-label="Archive pages">
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
