import { useState, useEffect } from 'react';
import { useTheme, api, logger } from '../../../shared';
import { MdSync, MdCheckCircle, MdAdd } from 'react-icons/md';

const PendingCommits = ({ onCreateVersion }) => {
  const { isDark } = useTheme();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedCommits, setSelectedCommits] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showProcessed, setShowProcessed] = useState(false);
  const commitsPerPage = 10;

  useEffect(() => {
    fetchPendingCommits();
  }, []);

  const fetchPendingCommits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/changelog/admin/pending-commits');
      setCommits(response.data.commits);
      setCurrentPage(1); // Reset to first page when fetching
    } catch (error) {
      logger.error('Error fetching pending commits:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter commits based on processed status
  const filteredCommits = showProcessed 
    ? commits 
    : commits.filter(c => !c.is_processed);

  // Group commits by date
  const groupedByDate = filteredCommits.reduce((groups, commit) => {
    const date = new Date(commit.commit_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(commit);
    return groups;
  }, {});

  // Pagination
  const totalPages = Math.ceil(filteredCommits.length / commitsPerPage);
  const startIndex = (currentPage - 1) * commitsPerPage;
  const endIndex = startIndex + commitsPerPage;
  const paginatedCommits = filteredCommits.slice(startIndex, endIndex);

  // Group paginated commits by date
  const paginatedGroupedByDate = paginatedCommits.reduce((groups, commit) => {
    const date = new Date(commit.commit_date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(commit);
    return groups;
  }, {});

  const handleSync = async () => {
    try {
      setSyncing(true);
      const response = await api.post('/changelog/admin/sync-commits');
      fetchPendingCommits();
      alert(response.data.message || 'Commits synced successfully!');
    } catch (error) {
      logger.error('Error syncing commits:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to sync commits';
      alert(errorMessage);
    } finally {
      setSyncing(false);
    }
  };

  const toggleCommit = (commitId) => {
    setSelectedCommits(prev => 
      prev.includes(commitId) 
        ? prev.filter(id => id !== commitId)
        : [...prev, commitId]
    );
  };

  const handleCreateFromCommits = async () => {
    if (selectedCommits.length === 0) {
      alert('Please select at least one commit');
      return;
    }
    
    const selected = commits.filter(c => selectedCommits.includes(c.id));
    await onCreateVersion(selected);
    
    // Refresh commits list and clear selection
    setSelectedCommits([]);
    fetchPendingCommits();
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading commits...</div>;
  }

  return (
    <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Git Commits
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            {filteredCommits.length} commit{filteredCommits.length !== 1 ? 's' : ''} 
            {!showProcessed && ` (${commits.filter(c => c.is_processed).length} processed)`}
          </p>
        </div>

        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            fontSize: '13px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '3px',
            background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(55, 53, 47, 0.05)'
          }}>
            <input
              type="checkbox"
              checked={showProcessed}
              onChange={(e) => {
                setShowProcessed(e.target.checked);
                setCurrentPage(1);
              }}
              style={{ cursor: 'pointer' }}
            />
            Show processed
          </label>
          
          {selectedCommits.length > 0 && (
            <button
              onClick={handleCreateFromCommits}
              className="btn-primary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                fontSize: '14px'
              }}
            >
              <MdAdd size={18} />
              Create Version ({selectedCommits.length})
            </button>
          )}
          
          <button
            onClick={handleSync}
            disabled={syncing}
            className="btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              fontSize: '14px'
            }}
          >
            <MdSync size={18} className={syncing ? 'spinning' : ''} />
            {syncing ? 'Syncing...' : 'Sync Commits'}
          </button>
        </div>
      </div>

      {filteredCommits.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px',
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
        }}>
          <MdCheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px' }}>
            {showProcessed ? 'No commits found' : 'All commits processed!'}
          </p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Click "Sync Commits" to check for new changes
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(paginatedGroupedByDate).map(([date, dateCommits]) => (
              <div key={date}>
                <div style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(55, 53, 47, 0.5)',
                  marginBottom: '8px',
                  paddingBottom: '4px',
                  borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
                }}>
                  {date}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {dateCommits.map(commit => (
                    <div
                      key={commit.id}
                      onClick={() => !commit.is_processed && toggleCommit(commit.id)}
                      style={{
                        padding: '12px',
                        borderRadius: '3px',
                        border: selectedCommits.includes(commit.id)
                          ? '2px solid var(--primary-color)'
                          : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'),
                        background: commit.is_processed
                          ? (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(55, 53, 47, 0.02)')
                          : selectedCommits.includes(commit.id)
                          ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                          : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)'),
                        cursor: commit.is_processed ? 'default' : 'pointer',
                        opacity: commit.is_processed ? 0.5 : 1,
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                        <input
                          type="checkbox"
                          checked={selectedCommits.includes(commit.id)}
                          onChange={() => {}}
                          disabled={commit.is_processed}
                          style={{ 
                            marginTop: '2px', 
                            cursor: commit.is_processed ? 'not-allowed' : 'pointer',
                            flexShrink: 0,
                            width: '16px',
                            height: '16px'
                          }}
                        />
                        
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            marginBottom: '4px',
                            wordBreak: 'break-word',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                          }}>
                            <span>{commit.commit_message}</span>
                            {commit.is_processed && (
                              <span style={{
                                fontSize: '11px',
                                padding: '2px 6px',
                                borderRadius: '3px',
                                background: isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)',
                                color: '#10b981'
                              }}>
                                ✓ Processed
                              </span>
                            )}
                          </div>
                          
                          <div style={{ 
                            fontSize: '12px',
                            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)',
                            display: 'flex',
                            gap: '12px',
                            flexWrap: 'wrap'
                          }}>
                            <span>{commit.author_name}</span>
                            <span>•</span>
                            <span>{new Date(commit.commit_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                            <span>•</span>
                            <span style={{ fontFamily: 'monospace', fontSize: '11px' }}>
                              {commit.commit_hash.substring(0, 7)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px',
              marginTop: '20px',
              paddingTop: '20px',
              borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
            }}>
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '6px 12px',
                  borderRadius: '3px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  background: 'transparent',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  opacity: currentPage === 1 ? 0.5 : 1,
                  fontSize: '13px'
                }}
              >
                Previous
              </button>
              
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '6px 12px',
                  borderRadius: '3px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                  background: 'transparent',
                  color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  opacity: currentPage === totalPages ? 0.5 : 1,
                  fontSize: '13px'
                }}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PendingCommits;
