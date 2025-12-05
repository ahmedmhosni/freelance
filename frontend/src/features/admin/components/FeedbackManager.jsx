import { useState, useEffect } from 'react';
import { api } from '../../../shared';
import { toast } from 'react-hot-toast';
import { MdDelete, MdCheckCircle, MdError, MdFilterList, MdImage, MdOpenInNew } from 'react-icons/md';

const FeedbackManager = () => {
    const [feedback, setFeedback] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ type: '', status: '' });
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [adminNotes, setAdminNotes] = useState('');

    useEffect(() => {
        fetchFeedback();
    }, [filters]);

    const fetchFeedback = async () => {
        setLoading(true);
        try {
            let url = '/api/feedback?';
            if (filters.type) url += `type=${filters.type}&`;
            if (filters.status) url += `status=${filters.status}`;

            const response = await api.get(url);
            setFeedback(response.data.feedback);
        } catch (error) {
            console.error('Error fetching feedback:', error);
            toast.error('Failed to load feedback');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/feedback/${id}`, { status: newStatus });
            toast.success('Status updated');
            fetchFeedback();
            if (selectedFeedback && selectedFeedback.id === id) {
                setSelectedFeedback(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Error updating status:', error);
            toast.error('Failed to update status');
        }
    };

    const handleNotesUpdate = async (id) => {
        try {
            await api.put(`/feedback/${id}`, { admin_notes: adminNotes });
            toast.success('Notes updated');
            fetchFeedback();
            if (selectedFeedback && selectedFeedback.id === id) {
                setSelectedFeedback(prev => ({ ...prev, admin_notes: adminNotes }));
            }
        } catch (error) {
            console.error('Error updating notes:', error);
            toast.error('Failed to update notes');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this feedback?')) return;

        try {
            await api.delete(`/feedback/${id}`);
            toast.success('Feedback deleted');
            fetchFeedback();
            if (selectedFeedback && selectedFeedback.id === id) {
                setSelectedFeedback(null);
            }
        } catch (error) {
            console.error('Error deleting feedback:', error);
            toast.error('Failed to delete feedback');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'new': return '#007bff';
            case 'in_progress': return '#ffc107';
            case 'completed': return '#28a745';
            case 'closed': return '#6c757d';
            default: return '#6c757d';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'bug': return '🐛';
            case 'feature': return '✨';
            case 'other': return '💬';
            default: return '📝';
        }
    };

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
                <h2>Feedback & Support</h2>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={filters.type}
                        onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                    >
                        <option value="">All Types</option>
                        <option value="bug">Bugs</option>
                        <option value="feature">Features</option>
                        <option value="other">Other</option>
                    </select>

                    <select
                        className="form-input"
                        style={{ width: 'auto' }}
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    >
                        <option value="">All Statuses</option>
                        <option value="new">New</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="closed">Closed</option>
                    </select>

                    <button className="btn-secondary" onClick={fetchFeedback} title="Refresh">
                        Refresh
                    </button>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading feedback...</div>
            ) : feedback.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    No feedback found matching your filters.
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* List View */}
                    <div style={{ maxHeight: '600px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                        {feedback.map(item => (
                            <div
                                key={item.id}
                                onClick={() => {
                                    setSelectedFeedback(item);
                                    setAdminNotes(item.admin_notes || '');
                                }}
                                style={{
                                    padding: '15px',
                                    borderBottom: '1px solid var(--border-color)',
                                    cursor: 'pointer',
                                    backgroundColor: selectedFeedback?.id === item.id ? 'var(--bg-hover)' : 'transparent',
                                    transition: 'background-color 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                                    <span style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                        {getTypeIcon(item.type)} {item.title}
                                    </span>
                                    <span style={{
                                        fontSize: '11px',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: getStatusColor(item.status),
                                        color: '#fff'
                                    }}>
                                        {item.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>
                                    From: {item.user_name} • {new Date(item.created_at).toLocaleDateString()}
                                </div>
                                <div style={{ fontSize: '13px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {item.description}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Detail View */}
                    <div style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '3px', backgroundColor: 'var(--bg-secondary)' }}>
                        {selectedFeedback ? (
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {getTypeIcon(selectedFeedback.type)} {selectedFeedback.title}
                                    </h3>
                                    <button
                                        onClick={() => handleDelete(selectedFeedback.id)}
                                        className="btn-delete"
                                        style={{ padding: '5px 10px', fontSize: '12px' }}
                                    >
                                        <MdDelete /> Delete
                                    </button>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Submitted by</div>
                                    <div>
                                        <strong>{selectedFeedback.user_name}</strong> ({selectedFeedback.user_email})
                                        <br />
                                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                            {new Date(selectedFeedback.created_at).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div style={{ marginBottom: '20px' }}>
                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Description</div>
                                    <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>{selectedFeedback.description}</div>
                                </div>

                                {selectedFeedback.screenshot_url && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '5px' }}>Screenshot</div>
                                        <a
                                            href={selectedFeedback.screenshot_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', color: 'var(--primary-color)' }}
                                        >
                                            <MdImage /> View Screenshot <MdOpenInNew />
                                        </a>
                                    </div>
                                )}

                                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                                    <h4>Admin Actions</h4>

                                    <div style={{ marginBottom: '15px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Status</label>
                                        <select
                                            className="form-input"
                                            value={selectedFeedback.status}
                                            onChange={(e) => handleStatusUpdate(selectedFeedback.id, e.target.value)}
                                        >
                                            <option value="new">New</option>
                                            <option value="in_progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                            <option value="closed">Closed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px' }}>Admin Notes</label>
                                        <textarea
                                            className="form-input"
                                            rows="3"
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            placeholder="Internal notes about this feedback..."
                                        />
                                        <button
                                            className="btn-primary"
                                            style={{ marginTop: '10px', width: '100%' }}
                                            onClick={() => handleNotesUpdate(selectedFeedback.id)}
                                        >
                                            Save Notes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', paddingTop: '100px' }}>
                                Select an item to view details
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackManager;
