const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage < maxVisible - 1) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div className="pagination-container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
      <div style={{ fontSize: '14px', color: '#666' }}>
        Showing {startItem}-{endItem} of {totalItems} items
      </div>
      
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            border: 'none',
            background: currentPage === 1 ? '#e9ecef' : '#fff',
            color: currentPage === 1 ? '#adb5bd' : '#495057',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          ««
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '8px 12px',
            border: 'none',
            background: currentPage === 1 ? '#e9ecef' : '#fff',
            color: currentPage === 1 ? '#adb5bd' : '#495057',
            borderRadius: '4px',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          «
        </button>

        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: '#fff',
                color: '#495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              1
            </button>
            {startPage > 2 && <span style={{ padding: '0 5px' }}>...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '8px 12px',
              border: 'none',
              background: page === currentPage ? '#007bff' : '#fff',
              color: page === currentPage ? '#fff' : '#495057',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: page === currentPage ? 'bold' : 'normal'
            }}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span style={{ padding: '0 5px' }}>...</span>}
            <button
              onClick={() => onPageChange(totalPages)}
              style={{
                padding: '8px 12px',
                border: 'none',
                background: '#fff',
                color: '#495057',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            border: 'none',
            background: currentPage === totalPages ? '#e9ecef' : '#fff',
            color: currentPage === totalPages ? '#adb5bd' : '#495057',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          »
        </button>
        
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '8px 12px',
            border: 'none',
            background: currentPage === totalPages ? '#e9ecef' : '#fff',
            color: currentPage === totalPages ? '#adb5bd' : '#495057',
            borderRadius: '4px',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          »»
        </button>
      </div>
    </div>
  );
};

export default Pagination;
