import { MdChevronLeft, MdChevronRight, MdFirstPage, MdLastPage } from 'react-icons/md';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  onItemsPerPageChange 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginTop: '20px',
      padding: '16px 0',
      borderTop: '1px solid rgba(55, 53, 47, 0.09)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)' }}>
          Showing {startItem}-{endItem} of {totalItems}
        </span>
        {onItemsPerPageChange && (
          <select
            value={itemsPerPage}
            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
            style={{ 
              padding: '6px 10px', 
              fontSize: '13px',
              border: '1px solid rgba(55, 53, 47, 0.16)',
              borderRadius: '3px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value={10}>10 per page</option>
            <option value={25}>25 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        )}
      </div>

      <div style={{ display: 'flex', gap: '4px' }}>
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 8px',
            border: '1px solid rgba(55, 53, 47, 0.16)',
            borderRadius: '3px',
            background: 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px'
          }}
          title="First page"
        >
          <MdFirstPage />
        </button>
        
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 8px',
            border: '1px solid rgba(55, 53, 47, 0.16)',
            borderRadius: '3px',
            background: 'white',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            opacity: currentPage === 1 ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px'
          }}
          title="Previous page"
        >
          <MdChevronLeft />
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span 
              key={`ellipsis-${index}`}
              style={{ 
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '13px',
                color: 'rgba(55, 53, 47, 0.4)'
              }}
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              style={{
                padding: '6px 12px',
                border: '1px solid rgba(55, 53, 47, 0.16)',
                borderRadius: '3px',
                background: currentPage === page ? '#2eaadc' : 'white',
                color: currentPage === page ? 'white' : '#37352f',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: currentPage === page ? '600' : '400',
                minWidth: '36px'
              }}
            >
              {page}
            </button>
          )
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 8px',
            border: '1px solid rgba(55, 53, 47, 0.16)',
            borderRadius: '3px',
            background: 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px'
          }}
          title="Next page"
        >
          <MdChevronRight />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 8px',
            border: '1px solid rgba(55, 53, 47, 0.16)',
            borderRadius: '3px',
            background: 'white',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            opacity: currentPage === totalPages ? 0.5 : 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: '16px'
          }}
          title="Last page"
        >
          <MdLastPage />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
