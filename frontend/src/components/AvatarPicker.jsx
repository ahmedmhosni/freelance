import { useState } from 'react';
import { MdClose } from 'react-icons/md';

// Character avatar library using DiceBear API (free, no upload needed)
const AVATAR_STYLES = [
  { id: 'avataaars', name: 'Avataaars', description: 'Cartoon avatars' },
  { id: 'bottts', name: 'Bottts', description: 'Robot avatars' },
  { id: 'personas', name: 'Personas', description: 'Professional avatars' },
  { id: 'initials', name: 'Initials', description: 'Letter-based avatars' },
  { id: 'lorelei', name: 'Lorelei', description: 'Illustrated avatars' },
  { id: 'micah', name: 'Micah', description: 'Diverse avatars' },
  { id: 'adventurer', name: 'Adventurer', description: 'Adventure style' },
  { id: 'big-smile', name: 'Big Smile', description: 'Happy faces' },
];

const AVATAR_SEEDS = [
  'Felix', 'Aneka', 'Jasmine', 'Max', 'Luna', 'Oliver', 'Emma', 'Leo',
  'Sophia', 'Jack', 'Mia', 'Charlie', 'Ava', 'George', 'Isabella', 'Oscar',
  'Amelia', 'Harry', 'Lily', 'Noah', 'Grace', 'Lucas', 'Ella', 'Mason',
  'Chloe', 'Ethan', 'Zoe', 'Logan', 'Aria', 'James', 'Riley', 'Benjamin'
];

const AvatarPicker = ({ currentAvatar, onSelect, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState('avataaars');
  const [hoveredAvatar, setHoveredAvatar] = useState(null);

  const generateAvatarUrl = (style, seed) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  const handleSelect = (url) => {
    onSelect(url);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          zIndex: 1
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Choose Your Avatar
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'rgba(55, 53, 47, 0.65)' }}>
              Select a style and pick your favorite character
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '4px',
              color: 'rgba(55, 53, 47, 0.65)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(55, 53, 47, 0.08)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Style Selector */}
        <div style={{ padding: '20px', borderBottom: '1px solid rgba(55, 53, 47, 0.09)' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '12px',
            color: 'rgba(55, 53, 47, 0.9)'
          }}>
            Avatar Style
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '8px'
          }}>
            {AVATAR_STYLES.map(style => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                style={{
                  padding: '12px',
                  border: selectedStyle === style.id 
                    ? '2px solid #2eaadc' 
                    : '1px solid rgba(55, 53, 47, 0.16)',
                  borderRadius: '6px',
                  backgroundColor: selectedStyle === style.id 
                    ? 'rgba(46, 170, 220, 0.08)' 
                    : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedStyle !== style.id) {
                    e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.3)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedStyle !== style.id) {
                    e.currentTarget.style.borderColor = 'rgba(55, 53, 47, 0.16)';
                  }
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '2px' }}>
                  {style.name}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(55, 53, 47, 0.65)' }}>
                  {style.description}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Avatar Grid */}
        <div style={{ padding: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: '500',
            marginBottom: '12px',
            color: 'rgba(55, 53, 47, 0.9)'
          }}>
            Choose Character
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '12px'
          }}>
            {AVATAR_SEEDS.map(seed => {
              const avatarUrl = generateAvatarUrl(selectedStyle, seed);
              const isHovered = hoveredAvatar === seed;
              const isCurrent = currentAvatar === avatarUrl;

              return (
                <button
                  key={seed}
                  onClick={() => handleSelect(avatarUrl)}
                  onMouseEnter={() => setHoveredAvatar(seed)}
                  onMouseLeave={() => setHoveredAvatar(null)}
                  style={{
                    padding: '8px',
                    border: isCurrent 
                      ? '3px solid #2eaadc' 
                      : isHovered 
                        ? '2px solid #2eaadc' 
                        : '1px solid rgba(55, 53, 47, 0.16)',
                    borderRadius: '8px',
                    backgroundColor: isCurrent 
                      ? 'rgba(46, 170, 220, 0.08)' 
                      : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    transform: isHovered ? 'scale(1.05)' : 'scale(1)',
                    position: 'relative'
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt={seed}
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                      borderRadius: '4px'
                    }}
                  />
                  {isCurrent && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      backgroundColor: '#2eaadc',
                      color: 'white',
                      borderRadius: '50%',
                      width: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ✓
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(55, 53, 47, 0.09)',
          backgroundColor: 'rgba(55, 53, 47, 0.03)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <p style={{
            margin: 0,
            fontSize: '11px',
            color: 'rgba(55, 53, 47, 0.5)'
          }}>
            Avatars powered by DiceBear
          </p>
          <button
            onClick={onClose}
            className="btn-edit"
            style={{ fontSize: '13px' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPicker;
