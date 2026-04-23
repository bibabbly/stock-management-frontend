import { MdKeyboardDoubleArrowLeft, MdKeyboardDoubleArrowRight, MdKeyboardArrowLeft, MdKeyboardArrowRight } from 'react-icons/md'

function Pagination({ page, totalPages, totalElements, pageSize, onPageChange, onPageSizeChange }) {

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i)
    } else {
      if (page <= 3) {
        pages.push(0, 1, 2, 3, 4, '...', totalPages - 1)
      } else if (page >= totalPages - 4) {
        pages.push(0, '...', totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1)
      } else {
        pages.push(0, '...', page - 1, page, page + 1, '...', totalPages - 1)
      }
    }
    return pages
  }

  const from = page * pageSize + 1
  const to = Math.min((page + 1) * pageSize, totalElements)

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4 px-1">

      {/* Left: showing info + rows per page */}
      <div className="flex items-center gap-3">
        <p className="text-xs" style={{ color: '#94a3b8' }}>
          Showing <span style={{ color: '#0f172a', fontWeight: 600 }}>{from}–{to}</span> of{' '}
          <span style={{ color: '#0f172a', fontWeight: 600 }}>{totalElements}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <span className="text-xs" style={{ color: '#94a3b8' }}>Rows:</span>
          <select
            value={pageSize}
            onChange={e => onPageSizeChange(parseInt(e.target.value))}
            className="text-xs rounded-lg px-2 py-1 focus:outline-none"
            style={{
              border: '1px solid #e2e8f0',
              background: 'white',
              color: '#0f172a',
              cursor: 'pointer'
            }}>
            {[10, 20, 50, 100].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: page controls */}
      <div className="flex items-center gap-1">

        {/* First page */}
        <button
          onClick={() => onPageChange(0)}
          disabled={page === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{
            background: page === 0 ? '#f8fafc' : 'white',
            color: page === 0 ? '#cbd5e1' : '#64748b',
            border: '1px solid #e2e8f0',
            cursor: page === 0 ? 'not-allowed' : 'pointer'
          }}
          title="First page">
          <MdKeyboardDoubleArrowLeft size={16} />
        </button>

        {/* Previous */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{
            background: page === 0 ? '#f8fafc' : 'white',
            color: page === 0 ? '#cbd5e1' : '#64748b',
            border: '1px solid #e2e8f0',
            cursor: page === 0 ? 'not-allowed' : 'pointer'
          }}
          title="Previous page">
          <MdKeyboardArrowLeft size={16} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((p, i) =>
          p === '...' ? (
            <span key={`dots-${i}`}
              className="w-8 h-8 flex items-center justify-center text-xs"
              style={{ color: '#94a3b8' }}>
              ···
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-all"
              style={{
                background: p === page
                  ? 'linear-gradient(135deg, #3b82f6, #06b6d4)'
                  : 'white',
                color: p === page ? 'white' : '#64748b',
                border: p === page ? 'none' : '1px solid #e2e8f0',
                cursor: 'pointer',
                boxShadow: p === page ? '0 2px 8px rgba(59,130,246,0.3)' : 'none'
              }}>
              {p + 1}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{
            background: page >= totalPages - 1 ? '#f8fafc' : 'white',
            color: page >= totalPages - 1 ? '#cbd5e1' : '#64748b',
            border: '1px solid #e2e8f0',
            cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
          }}
          title="Next page">
          <MdKeyboardArrowRight size={16} />
        </button>

        {/* Last page */}
        <button
          onClick={() => onPageChange(totalPages - 1)}
          disabled={page >= totalPages - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg transition-all"
          style={{
            background: page >= totalPages - 1 ? '#f8fafc' : 'white',
            color: page >= totalPages - 1 ? '#cbd5e1' : '#64748b',
            border: '1px solid #e2e8f0',
            cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer'
          }}
          title="Last page">
          <MdKeyboardDoubleArrowRight size={16} />
        </button>
      </div>
    </div>
  )
}

export default Pagination