import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import logger from '../utils/logger';
import { MdEdit, MdDelete, MdVisibility, MdVisibilityOff, MdAdd, MdExpandMore, MdExpandLess } from 'react-icons/md';
import PendingCommits from './PendingCommits';

const ChangelogEditor = () => {
  const { isDark } = useTheme();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showVersionForm, setShowVersionForm] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [expandedVersions, setExpandedVersions] = useState({});
  
  const [versionForm, setVersionForm] = useState({
    version: '',
    version_name: '',
    release_date: new Date().toISOString().split('T')[0],
    published: false,
    is_major_release: false
  });
  
  const [itemForm, setItemForm] = useState({
    category: 'feature',
    title: '',
    description: ''
  });
  
  const [editingItem, setEditingItem] = useState(null);
  const [editingVersionId, setEditingVersionId] = useState(null);
  const [nextVersion, setNextVersion] = useState('1.0.0');
  const [minorNames, setMinorNames] = useState([]);
  const [majorNames, setMajorNames] = useState([]);

  // Fetch version names from database
  useEffect(() => {
    fetchVersionNames();
  }, []);

  const fetchVersionNames = async () => {
    try {
      const [minorRes, majorRes] = await Promise.all([
        api.get('/changelog/admin/version-names?type=minor&unused_only=true'),
        api.get('/changelog/admin/version-names?type=major&unused_only=true')
      ]);
      setMinorNames(minorRes.data.names.map(n => n.name));
      setMajorNames(majorRes.data.names.map(n => n.name));
    } catch (error) {
      logger.error('Error fetching version names:', error);
    }
  };

  // Get next suggested name (first unused name from database)
  const getSuggestedName = (isMajor) => {
    const nameList = isMajor ? majorNames : minorNames;
    return nameList.length > 0 ? nameList[0] : '';
  };

  const typeOptions = [
    { value: 'feature', label: '✨ New Feature', icon: '✨' },
    { value: 'improvement', label: '⚡ Improvement', icon: '⚡' },
    { value: 'fix', label: '🐛 Bug Fix', icon: '🐛' },
    { value: 'design', label: '🎨 Design Update', icon: '🎨' },
    { value: 'security', label: '🔒 Security', icon: '🔒' }
  ];

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/changelog/admin/versions');
      setVersions(response.data);
      
      // Calculate next version
      if (response.data.length > 0) {
        const latestVersion = response.data[0].version;
        const parts = latestVersion.split('.');
        if (parts.length === 3) {
          const [major, minor, patch] = parts.map(Number);
          setNextVersion(`${major}.${minor}.${patch + 1}`);
        }
      }
    } catch (error) {
      logger.error('Error fetching versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVersionDetails = async (versionId) => {
    try {
      const response = await api.get(`/changelog/admin/versions/${versionId}`);
      setSelectedVersion(response.data);
    } catch (error) {
      logger.error('Error fetching version details:', error);
    }
  };

  const handleCreateVersion = async (e) => {
    e.preventDefault();
    try {
      if (editingVersionId) {
        await api.put(`/changelog/admin/versions/${editingVersionId}`, versionForm);
      } else {
        await api.post('/changelog/admin/versions', versionForm);
      }
      fetchVersions();
      fetchVersionNames(); // Refresh available names
      resetVersionForm();
    } catch (error) {
      logger.error('Error saving version:', error);
      alert(error.response?.data?.error || 'Failed to save version');
    }
  };

  const handleTogglePublish = async (id, currentStatus) => {
    try {
      await api.patch(`/changelog/admin/versions/${id}/publish`, { 
        published: !currentStatus 
      });
      fetchVersions();
      if (selectedVersion?.id === id) {
        fetchVersionDetails(id);
      }
    } catch (error) {
      logger.error('Error toggling publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const handleDeleteVersion = async (id) => {
    if (!confirm('Delete this version and all its items?')) return;
    try {
      await api.delete(`/changelog/admin/versions/${id}`);
      fetchVersions();
      if (selectedVersion?.id === id) {
        setSelectedVersion(null);
      }
    } catch (error) {
      logger.error('Error deleting version:', error);
      alert('Failed to delete version');
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!selectedVersion) return;
    
    try {
      if (editingItem) {
        await api.put(`/changelog/admin/items/${editingItem.id}`, itemForm);
      } else {
        await api.post(`/changelog/admin/versions/${selectedVersion.id}/items`, itemForm);
      }
      fetchVersionDetails(selectedVersion.id);
      resetItemForm();
    } catch (error) {
      logger.error('Error saving item:', error);
      alert('Failed to save item');
    }
  };
  
  const handleEditItem = (item) => {
    setEditingItem(item);
    setItemForm({
      category: item.category,
      title: item.title,
      description: item.description || ''
    });
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return;
    try {
      await api.delete(`/changelog/admin/items/${itemId}`);
      fetchVersionDetails(selectedVersion.id);
    } catch (error) {
      logger.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const toggleVersionExpand = (versionId) => {
    setExpandedVersions(prev => ({
      ...prev,
      [versionId]: !prev[versionId]
    }));
    if (!expandedVersions[versionId]) {
      fetchVersionDetails(versionId);
    }
  };

  const resetVersionForm = () => {
    setVersionForm({
      version: nextVersion,
      version_name: '',
      release_date: new Date().toISOString().split('T')[0],
      published: false,
      is_major_release: false
    });
    setShowVersionForm(false);
    setEditingVersionId(null);
  };

  const handleEditVersion = (version) => {
    setEditingVersionId(version.id);
    // Convert ISO date to yyyy-MM-dd format for date input
    const dateOnly = version.release_date ? version.release_date.split('T')[0] : new Date().toISOString().split('T')[0];
    setVersionForm({
      version: version.version,
      version_name: version.version_name || '',
      release_date: dateOnly,
      published: version.is_published,
      is_major_release: version.is_major_release || false
    });
    setShowVersionForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetItemForm = () => {
    setItemForm({
      category: 'feature',
      title: '',
      description: ''
    });
    setEditingItem(null);
  };

  const handleCreateFromCommits = async (selectedCommits) => {
    try {
      // Create the version first
      const versionData = {
        version: nextVersion,
        version_name: '',
        release_date: new Date().toISOString().split('T')[0],
        published: false,
        is_major_release: false
      };
      
      const versionResponse = await api.post('/changelog/admin/versions', versionData);
      const newVersionId = versionResponse.data.id;
      
      // Add each commit as an item
      for (const commit of selectedCommits) {
        // Determine category from commit message
        const message = commit.commit_message.toLowerCase();
        let category = 'improvement';
        
        if (message.includes('fix') || message.includes('bug')) {
          category = 'fix';
        } else if (message.includes('add') || message.includes('new') || message.includes('feature')) {
          category = 'feature';
        } else if (message.includes('design') || message.includes('style') || message.includes('ui')) {
          category = 'design';
        } else if (message.includes('security') || message.includes('auth')) {
          category = 'security';
        }
        
        await api.post(`/changelog/admin/versions/${newVersionId}/items`, {
          category,
          title: commit.commit_message,
          description: `By ${commit.author_name} on ${new Date(commit.commit_date).toLocaleDateString()}`
        });
      }
      
      // Mark commits as processed
      await api.post('/changelog/admin/mark-commits-processed', {
        commitIds: selectedCommits.map(c => c.id),
        versionId: newVersionId
      });
      
      // Refresh everything
      fetchVersions();
      
      // Expand the new version
      setExpandedVersions({ [newVersionId]: true });
      fetchVersionDetails(newVersionId);
      
      alert(`Version ${nextVersion} created with ${selectedCommits.length} items!`);
      
      // Scroll to versions section
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }, 500);
    } catch (error) {
      logger.error('Error creating version from commits:', error);
      alert('Failed to create version from commits');
    }
  };

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  // Check if we're in development (git sync only works locally)
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  return (
    <div>
      {/* Pending Commits Section - Only show in development */}
      {isDevelopment && <PendingCommits onCreateVersion={handleCreateFromCommits} />}
      
      {/* Changelog Management */}
      <div className="card" style={{ padding: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Changelog Management
            </h2>
            <p style={{ 
              margin: '4px 0 0 0', 
              fontSize: '13px',
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
            }}>
              Create versions and add multiple items per version
            </p>
          </div>
        
        <button
          onClick={() => {
            const suggestedName = getSuggestedName(false); // Default to minor
            setVersionForm({ 
              ...versionForm, 
              version: nextVersion,
              version_name: suggestedName,
              is_major_release: false
            });
            setShowVersionForm(true);
          }}
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
          New Version {nextVersion}
        </button>
      </div>

      {/* Version Form */}
      {showVersionForm && (
        <form onSubmit={handleCreateVersion} style={{ 
          marginBottom: '32px',
          padding: '20px',
          borderRadius: '3px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '16px' }}>
            {editingVersionId ? 'Edit Version' : 'Create New Version'}
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label className="form-label">Version Number</label>
              <input
                type="text"
                className="form-input"
                value={versionForm.version}
                onChange={(e) => setVersionForm({ ...versionForm, version: e.target.value })}
                placeholder="e.g., 1.0.0"
                required
              />
            </div>
            
            <div>
              <label className="form-label">Release Date</label>
              <input
                type="date"
                className="form-input"
                value={versionForm.release_date}
                onChange={(e) => setVersionForm({ ...versionForm, release_date: e.target.value })}
                required
              />
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label className="form-label">Version Name (Optional)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="form-input"
                value={versionForm.version_name}
                onChange={(e) => setVersionForm({ ...versionForm, version_name: e.target.value })}
                placeholder={versionForm.is_major_release ? 'e.g., "Espresso", "Cappuccino"' : 'e.g., "Nordic", "Vienna"'}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                onClick={() => {
                  const suggested = getSuggestedName(versionForm.is_major_release);
                  setVersionForm({ ...versionForm, version_name: suggested });
                }}
                className="btn-secondary"
                style={{ padding: '8px 16px', fontSize: '13px', whiteSpace: 'nowrap' }}
              >
                ☕ Suggest
              </button>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {versionForm.is_major_release 
                ? '🔥 Major release: Specialty coffee drink names' 
                : '☕ Minor update: Coffee roasting level names'}
            </p>
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={versionForm.is_major_release}
                onChange={(e) => {
                  const isMajor = e.target.checked;
                  const suggestedName = getSuggestedName(isMajor);
                  setVersionForm({ 
                    ...versionForm, 
                    is_major_release: isMajor,
                    version_name: suggestedName
                  });
                }}
                style={{ 
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0
                }}
              />
              🎉 Major Release (special highlight)
            </label>
            
            <label style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}>
              <input
                type="checkbox"
                checked={versionForm.published}
                onChange={(e) => setVersionForm({ ...versionForm, published: e.target.checked })}
                style={{ 
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  flexShrink: 0
                }}
              />
              Publish immediately
            </label>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="submit" className="btn-primary">
              {editingVersionId ? 'Update Version' : 'Create Version'}
            </button>
            <button 
              type="button" 
              onClick={resetVersionForm}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Versions List */}
      <div>
        {versions.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '48px',
            color: isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(55, 53, 47, 0.4)'
          }}>
            <p style={{ fontSize: '14px' }}>No versions yet</p>
            <p style={{ fontSize: '13px', marginTop: '8px' }}>
              Create your first version to start building your changelog
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {versions.map(version => (
              <div
                key={version.id}
                style={{
                  borderRadius: '3px',
                  border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
                  background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
                  overflow: 'hidden'
                }}
              >
                {/* Version Header */}
                <div style={{
                  padding: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '16px'
                }}>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => toggleVersionExpand(version.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '4px',
                        display: 'flex',
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
                      }}
                    >
                      {expandedVersions[version.id] ? <MdExpandLess size={20} /> : <MdExpandMore size={20} />}
                    </button>
                    
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '16px', fontWeight: '600' }}>
                          v{version.version}
                        </span>
                        {version.version_name && (
                          <span style={{ 
                            fontSize: '14px', 
                            fontWeight: '500',
                            color: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(55, 53, 47, 0.7)'
                          }}>
                            "{version.version_name}"
                          </span>
                        )}
                        {version.is_major_release && (
                          <span style={{
                            fontSize: '11px',
                            padding: '2px 8px',
                            borderRadius: '3px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '600'
                          }}>
                            🎉 MAJOR
                          </span>
                        )}
                        <span style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          background: version.is_published 
                            ? (isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)')
                            : (isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(55, 53, 47, 0.08)'),
                          color: version.is_published ? '#10b981' : (isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.6)')
                        }}>
                          {version.is_published ? 'Published' : 'Draft'}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {version.items_count} item{version.items_count !== '1' ? 's' : ''}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        {new Date(version.release_date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => handleEditVersion(version)}
                      title="Edit version"
                      style={{
                        padding: '6px',
                        borderRadius: '3px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                        background: 'transparent',
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                        cursor: 'pointer'
                      }}
                    >
                      <MdEdit size={16} />
                    </button>
                    
                    <button
                      onClick={() => handleTogglePublish(version.id, version.is_published)}
                      title={version.is_published ? 'Unpublish' : 'Publish'}
                      style={{
                        padding: '6px',
                        borderRadius: '3px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                        background: 'transparent',
                        color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                        cursor: 'pointer'
                      }}
                    >
                      {version.is_published ? <MdVisibilityOff size={16} /> : <MdVisibility size={16} />}
                    </button>
                    
                    <button
                      onClick={() => handleDeleteVersion(version.id)}
                      title="Delete"
                      style={{
                        padding: '6px',
                        borderRadius: '3px',
                        border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                        background: 'transparent',
                        color: '#eb5757',
                        cursor: 'pointer'
                      }}
                    >
                      <MdDelete size={16} />
                    </button>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedVersions[version.id] && selectedVersion?.id === version.id && (
                  <div style={{
                    padding: '16px',
                    borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
                    background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.02)'
                  }}>
                    {/* Add/Edit Item Form */}
                    <form onSubmit={handleAddItem} style={{ marginBottom: '16px' }}>
                      <h4 style={{ margin: '0 0 12px 0', fontSize: '14px' }}>
                        {editingItem ? 'Edit Item' : 'Add Item'}
                      </h4>
                      <div style={{ display: 'grid', gap: '12px' }}>
                        <select
                          className="form-input"
                          value={itemForm.category}
                          onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                          required
                        >
                          {typeOptions.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          className="form-input"
                          value={itemForm.title}
                          onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                          placeholder="Title"
                          required
                        />
                        
                        <textarea
                          className="form-input"
                          value={itemForm.description}
                          onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                          placeholder="Description (optional)"
                          rows={2}
                        />
                        
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn-primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
                            {editingItem ? 'Update Item' : 'Add Item'}
                          </button>
                          {editingItem && (
                            <button 
                              type="button" 
                              onClick={resetItemForm}
                              className="btn-secondary" 
                              style={{ fontSize: '13px', padding: '6px 12px' }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    </form>

                    {/* Items List */}
                    {selectedVersion.items && selectedVersion.items.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {selectedVersion.items.map(item => {
                          const typeOption = typeOptions.find(t => t.value === item.category);
                          return (
                            <div
                              key={item.id}
                              style={{
                                padding: '12px',
                                borderRadius: '3px',
                                background: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.8)',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'start',
                                gap: '12px'
                              }}
                            >
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '14px' }}>{typeOption?.icon}</span>
                                  <span style={{ fontSize: '13px', fontWeight: '500' }}>{item.title}</span>
                                </div>
                                {item.description && (
                                  <p style={{ 
                                    fontSize: '12px', 
                                    color: 'var(--text-secondary)', 
                                    margin: '0 0 0 20px',
                                    lineHeight: '1.4'
                                  }}>
                                    {item.description}
                                  </p>
                                )}
                              </div>
                              <div style={{ display: 'flex', gap: '4px' }}>
                                <button
                                  onClick={() => handleEditItem(item)}
                                  style={{
                                    padding: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                                    cursor: 'pointer'
                                  }}
                                  title="Edit"
                                >
                                  <MdEdit size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteItem(item.id)}
                                  style={{
                                    padding: '4px',
                                    background: 'none',
                                    border: 'none',
                                    color: '#eb5757',
                                    cursor: 'pointer'
                                  }}
                                  title="Delete"
                                >
                                  <MdDelete size={14} />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', padding: '16px' }}>
                        No items yet. Add your first item above.
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default ChangelogEditor;
