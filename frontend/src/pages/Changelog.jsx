import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Changelog = () => {
  const [changelog, setChangelog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChangelog();
  }, []);

  const fetchChangelog = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || '';
      const response = await axios.get(`${apiUrl}/api/changelog/public`);
      setChangelog(response.data);
    } catch (error) {
      console.error('Failed to fetch changelog:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = (item) => (
    <li
      key={item.id}
      style={{
        marginBottom: '12px',
        paddingLeft: '28px',
        position: 'relative',
      }}
    >
      <span
        style={{
          position: 'absolute',
          left: 0,
          fontSize: '16px',
        }}
      >
        {item.category === 'feature' && '✨'}
        {item.category === 'improvement' && '⚡'}
        {item.category === 'fix' && '🐛'}
        {item.category === 'design' && '🎨'}
        {item.category === 'security' && '🔒'}
      </span>
      <div>
        <span style={{ fontSize: '14px', fontWeight: '500' }}>
          {item.title}
        </span>
        {item.description && (
          <p
            style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: '4px 0 0 0',
              lineHeight: '1.5',
            }}
          >
            {item.description}
          </p>
        )}
      </div>
    </li>
  );

  if (loading) {
    return (
      <div className="legal-page">
        <div className="legal-container">
          <p style={{ textAlign: 'center', padding: '48px' }}>
            Loading changelog...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="legal-page">
      <div className="legal-container">
        {/* Header */}
        <div className="legal-header">
          <Link to="/" className="back-link">
            ← Back to home
          </Link>

          <h1 className="legal-title">Changelog</h1>

          <p className="legal-date">Recent updates and improvements</p>
        </div>

        {/* Content */}
        <div className="card" style={{ padding: '48px' }}>
          {changelog && changelog.versions && changelog.versions.length > 0 ? (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}
            >
              {changelog.versions.map((version, index) => (
                <div key={version.id}>
                  {/* Version Header */}
                  <div
                    style={{
                      marginBottom: '24px',
                      paddingBottom: '16px',
                      borderBottom: version.is_major_release
                        ? '3px solid transparent'
                        : '2px solid var(--primary-color)',
                      borderImage: version.is_major_release
                        ? 'linear-gradient(90deg, #667eea 0%, #764ba2 100%) 1'
                        : 'none',
                      background: version.is_major_release
                        ? 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
                        : 'transparent',
                      padding: version.is_major_release ? '16px' : '0',
                      borderRadius: version.is_major_release ? '8px' : '0',
                      marginTop: version.is_major_release ? '8px' : '0',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        marginBottom: '8px',
                        flexWrap: 'wrap',
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: version.is_major_release ? '28px' : '24px',
                          fontWeight: '700',
                        }}
                      >
                        Version {version.version}
                      </h2>
                      {version.version_name && (
                        <span
                          style={{
                            fontSize: version.is_major_release
                              ? '20px'
                              : '16px',
                            fontWeight: '600',
                            color: 'var(--text-secondary)',
                            fontStyle: 'italic',
                          }}
                        >
                          "{version.version_name}"
                        </span>
                      )}
                      {version.is_major_release && (
                        <span
                          style={{
                            fontSize: '14px',
                            padding: '6px 14px',
                            borderRadius: '20px',
                            background:
                              'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            color: 'white',
                            fontWeight: '600',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                          }}
                        >
                          🎉 MAJOR RELEASE
                        </span>
                      )}
                      {index === 0 && !version.is_major_release && (
                        <span
                          style={{
                            fontSize: '12px',
                            padding: '4px 10px',
                            borderRadius: '12px',
                            background: 'var(--primary-color)',
                            color: 'white',
                            fontWeight: '500',
                          }}
                        >
                          Latest
                        </span>
                      )}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      Released on{' '}
                      {new Date(version.release_date).toLocaleDateString(
                        'en-US',
                        {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        }
                      )}
                    </p>
                  </div>

                  {/* Features */}
                  {version.grouped.features.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        ✨ New Features
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {version.grouped.features.map(renderItem)}
                      </ul>
                    </div>
                  )}

                  {/* Improvements */}
                  {version.grouped.improvements.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        ⚡ Improvements
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {version.grouped.improvements.map(renderItem)}
                      </ul>
                    </div>
                  )}

                  {/* Fixes */}
                  {version.grouped.fixes.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        🐛 Bug Fixes
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {version.grouped.fixes.map(renderItem)}
                      </ul>
                    </div>
                  )}

                  {/* Design */}
                  {version.grouped.design.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        🎨 Design Updates
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {version.grouped.design.map(renderItem)}
                      </ul>
                    </div>
                  )}

                  {/* Security */}
                  {version.grouped.security.length > 0 && (
                    <div style={{ marginBottom: '28px' }}>
                      <h3
                        style={{
                          fontSize: '18px',
                          fontWeight: '600',
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                        }}
                      >
                        🔒 Security
                      </h3>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                        {version.grouped.security.map(renderItem)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '48px',
                color: 'var(--text-secondary)',
              }}
            >
              <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                No updates yet
              </p>
              <p style={{ fontSize: '14px' }}>
                Check back later for new features and improvements
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="legal-footer">
          <p>
            Showing {changelog?.versions?.length || 0} version
            {changelog?.versions?.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
