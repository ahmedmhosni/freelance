import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import logger from '../utils/logger';
import { MdSync, MdCheckCircle, MdAdd } from 'react-icons/md';

const PendingCommits = ({ onCreateVersion }) => {
  const { isDark } = useTheme();
  const [commits, setCommits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [selectedCommits, setSelectedCommits] = useState([]);

  useEffect(() => {
    fetchPendingCommits();
  }, []);

  const fetchPendingCommits = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/changelog/admin/pending-commits');
      setCommits(response.data.commits);
    } catch (error) {
      logger.error('Error fetching pending commits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      await api.post('/api/changelog/admin/sync-commits');
      fetchPendingCommits();
      alert('Commits synced successfully!');
    } catch (error) {
      logger.error('Error syncing commits:', error);
      alert('Failed to sync commits');
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

  const handleCreateFromCommits = () => {
    if (selectedCommits.length === 0) {
      alert('Please select at least one commit');
      return;
    }
    
    const selected = commits.filter(c => selectedCommits.includes(c.id));
    onCreateVersion(selected);
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
        marginBottom: '20px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Pending Git Commits
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            {commits.length} unprocessed commit{commits.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
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

      {commits.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '48px',
          color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
        }}>
          <MdCheckCircle size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <p style={{ fontSize: '14px' }}>All commits processed!</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Click "Sync Commits" to check for new changes
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {commits.map(commit => (
            <div
              key={commit.id}
              onClick={() => toggleCommit(commit.id)}
              style={{
                padding: '12px',
                borderRadius: '3px',
                border: selectedCommits.includes(commit.id)
                  ? '2px solid var(--primary-color)'
                  : (isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'),
                background: selectedCommits.includes(commit.id)
                  ? (isDark ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.05)')
                  : (isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)'),
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'start', gap: '12px' }}>
                <input
                  type="checkbox"
                  checked={selectedCommits.includes(commit.id)}
                  onChange={() => {}}
                  style={{ marginTop: '2px', cursor: 'pointer' }}
                />
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '500',
                    marginBottom: '4px'
                  }}>
                    {commit.commit_message}
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
                    <span>{new Date(commit.commit_date).toLocaleDateString()}</span>
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
      )}
    </div>
  );
};

export default PendingCommits;
