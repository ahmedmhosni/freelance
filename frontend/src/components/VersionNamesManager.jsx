import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import logger from '../utils/logger';
import { MdAdd, MdEdit, MdDelete, MdSave, MdClose } from 'react-icons/md';

const VersionNamesManager = () => {
  const { isDark } = useTheme();
  const [minorNames, setMinorNames] = useState([]);
  const [majorNames, setMajorNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', name_type: 'minor', description: '' });

  useEffect(() => {
    fetchNames();
  }, []);

  const fetchNames = async () => {
    try {
      setLoading(true);
      const [minorRes, majorRes] = await Promise.all([
        api.get('/changelog/admin/version-names?type=minor'),
        api.get('/changelog/admin/version-names?type=major')
      ]);
      setMinorNames(minorRes.data.names);
      setMajorNames(majorRes.data.names);
    } catch (error) {
      logger.error('Error fetching version names:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/changelog/admin/version-names', addForm);
      fetchNames();
      setAddForm({ name: '', name_type: 'minor', description: '' });
      setShowAddForm(false);
    } catch (error) {
      logger.error('Error adding name:', error);
      alert(error.response?.data?.error || 'Failed to add name');
    }
  };

  const handleEdit = (name) => {
    setEditingId(name.id);
    setEditForm({ name: name.name, description: name.description || '' });
  };

  const handleSave = async (id, sort_order) => {
    try {
      await api.put(`/api/changelog/admin/version-names/${id}`, {
        ...editForm,
        sort_order
      });
      fetchNames();
      setEditingId(null);
    } catch (error) {
      logger.error('Error updating name:', error);
      alert('Failed to update name');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this name?')) return;
    try {
      await api.delete(`/api/changelog/admin/version-names/${id}`);
      fetchNames();
    } catch (error) {
      logger.error('Error deleting name:', error);
      alert('Failed to delete name');
    }
  };

  const renderNamesList = (names, title, icon) => (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ 
        fontSize: '16px', 
        fontWeight: '600', 
        marginBottom: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {icon} {title}
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: '400' }}>
          ({names.length} names)
        </span>
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {names.map(name => (
          <div
            key={name.id}
            style={{
              padding: '12px',
              borderRadius: '3px',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)',
              background: isDark ? 'rgba(255, 255, 255, 0.02)' : 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px'
            }}
          >
            {editingId === name.id ? (
              <>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    style={{ fontSize: '14px', padding: '6px 10px' }}
                  />
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.description}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Description (optional)"
                    style={{ fontSize: '13px', padding: '6px 10px' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleSave(name.id, name.sort_order)}
                    style={{
                      padding: '6px',
                      borderRadius: '3px',
                      border: 'none',
                      background: '#10b981',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    <MdSave size={16} />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      padding: '6px',
                      borderRadius: '3px',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                      background: 'transparent',
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                      cursor: 'pointer'
                    }}
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                    {name.name}
                  </div>
                  {name.description && (
                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {name.description}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => handleEdit(name)}
                    style={{
                      padding: '6px',
                      borderRadius: '3px',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                      background: 'transparent',
                      color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)',
                      cursor: 'pointer'
                    }}
                  >
                    <MdEdit size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(name.id)}
                    style={{
                      padding: '6px',
                      borderRadius: '3px',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid rgba(55, 53, 47, 0.16)',
                      background: 'transparent',
                      color: '#eb5757',
                      cursor: 'pointer'
                    }}
                  >
                    <MdDelete size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div className="card" style={{ padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
            Version Names Library
          </h2>
          <p style={{ 
            margin: '4px 0 0 0', 
            fontSize: '13px',
            color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(55, 53, 47, 0.65)'
          }}>
            Manage coffee-themed version names
          </p>
        </div>
        
        <button
          onClick={() => setShowAddForm(!showAddForm)}
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
          {showAddForm ? 'Cancel' : 'Add Name'}
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} style={{ 
          marginBottom: '32px',
          padding: '16px',
          borderRadius: '3px',
          background: isDark ? 'rgba(255, 255, 255, 0.03)' : 'rgba(55, 53, 47, 0.03)',
          border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(55, 53, 47, 0.09)'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              className="form-input"
              value={addForm.name}
              onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              placeholder="Name (e.g., Espresso)"
              required
            />
            <select
              className="form-input"
              value={addForm.name_type}
              onChange={(e) => setAddForm({ ...addForm, name_type: e.target.value })}
            >
              <option value="minor">☕ Minor (Roast Level)</option>
              <option value="major">🔥 Major (Coffee Drink)</option>
            </select>
          </div>
          <input
            type="text"
            className="form-input"
            value={addForm.description}
            onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
            placeholder="Description (optional)"
            style={{ marginBottom: '12px' }}
          />
          <button type="submit" className="btn-primary" style={{ fontSize: '13px', padding: '6px 12px' }}>
            Add Name
          </button>
        </form>
      )}

      {/* Names Lists */}
      {renderNamesList(minorNames, 'Minor Updates', '☕')}
      {renderNamesList(majorNames, 'Major Releases', '🔥')}
    </div>
  );
};

export default VersionNamesManager;
