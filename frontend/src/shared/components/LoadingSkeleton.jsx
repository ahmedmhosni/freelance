const LoadingSkeleton = ({ type = 'card', count = 1 }) => {
  const skeletons = Array(count).fill(0);

  if (type === 'table') {
    return (
      <div className="card">
        <div style={{ width: '100%' }}>
          {skeletons.map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: '15px', padding: '15px', borderBottom: '1px solid #eee' }}>
              <div className="skeleton" style={{ width: '30%', height: '20px' }} />
              <div className="skeleton" style={{ width: '25%', height: '20px' }} />
              <div className="skeleton" style={{ width: '20%', height: '20px' }} />
              <div className="skeleton" style={{ width: '25%', height: '20px' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'card') {
    return (
      <>
        {skeletons.map((_, i) => (
          <div key={i} className="card" style={{ marginBottom: '15px' }}>
            <div className="skeleton" style={{ width: '60%', height: '24px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80%', height: '16px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '40%', height: '16px' }} />
          </div>
        ))}
      </>
    );
  }

  if (type === 'stat') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {skeletons.map((_, i) => (
          <div key={i} className="card">
            <div className="skeleton" style={{ width: '50%', height: '20px', marginBottom: '15px' }} />
            <div className="skeleton" style={{ width: '70%', height: '40px' }} />
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
