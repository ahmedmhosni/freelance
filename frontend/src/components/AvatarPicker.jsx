import { useState, useRef } from 'react';
import { MdClose, MdCloudUpload, MdImage } from 'react-icons/md';
import api from '../utils/api';
import toast from 'react-hot-toast';

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
  'Felix',
  'Aneka',
  'Jasmine',
  'Max',
  'Luna',
  'Oliver',
  'Emma',
  'Leo',
  'Sophia',
  'Jack',
  'Mia',
  'Charlie',
  'Ava',
  'George',
  'Isabella',
  'Oscar',
  'Amelia',
  'Harry',
  'Lily',
  'Noah',
  'Grace',
  'Lucas',
  'Ella',
  'Mason',
  'Chloe',
  'Ethan',
  'Zoe',
  'Logan',
  'Aria',
  'James',
  'Riley',
  'Benjamin',
];

const AvatarPicker = ({ currentAvatar, onSelect, onClose }) => {
  const [selectedStyle, setSelectedStyle] = useState('avataaars');
  const [hoveredAvatar, setHoveredAvatar] = useState(null);
  const [uploadMode, setUploadMode] = useState('avatar'); // 'avatar' or 'upload'
  const [uploading, setUploading] = useState(false);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileInputRef = useRef(null);

  const generateAvatarUrl = (style, seed) => {
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;
  };

  const handleSelect = (url) => {
    onSelect(url);
    onClose();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error(
          'Please select a valid image file (JPG, PNG, GIF, or WebP)'
        );
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toast.error('File size must be less than 5MB');
        return;
      }

      // Show preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result);
      };
      reader.readAsDataURL(file);

      // Upload file
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file) => {
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await api.post('/api/profile/upload-picture', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedUrl = response.data.url;
      toast.success('Picture uploaded successfully!');

      // Update profile with new picture
      onSelect(uploadedUrl);
      onClose();
    } catch (error) {
      console.error('Error uploading picture:', error);
      toast.error(error.response?.data?.error || 'Failed to upload picture');
      setUploadPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div
      style={{
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
        padding: '20px',
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '800px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            backgroundColor: 'white',
            zIndex: 1,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '600' }}>
              Profile Picture
            </h2>
            <p
              style={{
                margin: '4px 0 0 0',
                fontSize: '13px',
                color: 'rgba(55, 53, 47, 0.65)',
              }}
            >
              {uploadMode === 'avatar'
                ? 'Select a style and pick your favorite character'
                : 'Upload your own profile picture'}
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
              color: 'rgba(55, 53, 47, 0.65)',
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = 'rgba(55, 53, 47, 0.08)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Mode Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            padding: '0 20px',
            borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
          }}
        >
          <button
            onClick={() => setUploadMode('avatar')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom:
                uploadMode === 'avatar'
                  ? '2px solid #2eaadc'
                  : '2px solid transparent',
              color:
                uploadMode === 'avatar' ? '#2eaadc' : 'rgba(55, 53, 47, 0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <MdImage /> Choose Avatar
          </button>
          <button
            onClick={() => setUploadMode('upload')}
            style={{
              padding: '12px 16px',
              background: 'none',
              border: 'none',
              borderBottom:
                uploadMode === 'upload'
                  ? '2px solid #2eaadc'
                  : '2px solid transparent',
              color:
                uploadMode === 'upload' ? '#2eaadc' : 'rgba(55, 53, 47, 0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <MdCloudUpload /> Upload Picture
          </button>
        </div>

        {/* Upload Mode */}
        {uploadMode === 'upload' && (
          <div style={{ padding: '40px 20px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            <div
              style={{
                textAlign: 'center',
                padding: '40px 20px',
                border: '2px dashed rgba(55, 53, 47, 0.2)',
                borderRadius: '8px',
                backgroundColor: 'rgba(55, 53, 47, 0.02)',
              }}
            >
              {uploadPreview ? (
                <div>
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    style={{
                      width: '150px',
                      height: '150px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      marginBottom: '16px',
                    }}
                  />
                  <p
                    style={{
                      fontSize: '14px',
                      color: 'rgba(55, 53, 47, 0.65)',
                    }}
                  >
                    {uploading ? 'Uploading...' : 'Upload complete!'}
                  </p>
                </div>
              ) : (
                <>
                  <MdCloudUpload
                    style={{
                      fontSize: '48px',
                      color: 'rgba(55, 53, 47, 0.4)',
                      marginBottom: '16px',
                    }}
                  />

                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'rgba(55, 53, 47, 0.9)',
                      marginBottom: '8px',
                    }}
                  >
                    Upload Your Picture
                  </h3>

                  <p
                    style={{
                      fontSize: '14px',
                      color: 'rgba(55, 53, 47, 0.6)',
                      marginBottom: '20px',
                    }}
                  >
                    JPG, PNG, GIF or WebP • Max 5MB
                  </p>

                  <button
                    onClick={triggerFileInput}
                    disabled={uploading}
                    className="btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      opacity: uploading ? 0.6 : 1,
                      cursor: uploading ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <MdCloudUpload />
                    {uploading ? 'Uploading...' : 'Select File'}
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Avatar Mode */}
        {uploadMode === 'avatar' && (
          <>
            {/* Style Selector */}
            <div
              style={{
                padding: '20px',
                borderBottom: '1px solid rgba(55, 53, 47, 0.09)',
              }}
            >
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  color: 'rgba(55, 53, 47, 0.9)',
                }}
              >
                Avatar Style
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: '8px',
                }}
              >
                {AVATAR_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    style={{
                      padding: '12px',
                      border:
                        selectedStyle === style.id
                          ? '2px solid #2eaadc'
                          : '1px solid rgba(55, 53, 47, 0.16)',
                      borderRadius: '6px',
                      backgroundColor:
                        selectedStyle === style.id
                          ? 'rgba(46, 170, 220, 0.08)'
                          : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (selectedStyle !== style.id) {
                        e.currentTarget.style.borderColor =
                          'rgba(55, 53, 47, 0.3)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedStyle !== style.id) {
                        e.currentTarget.style.borderColor =
                          'rgba(55, 53, 47, 0.16)';
                      }
                    }}
                  >
                    <div
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        marginBottom: '2px',
                      }}
                    >
                      {style.name}
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'rgba(55, 53, 47, 0.65)',
                      }}
                    >
                      {style.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Avatar Grid */}
            <div style={{ padding: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '12px',
                  color: 'rgba(55, 53, 47, 0.9)',
                }}
              >
                Choose Character
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
                  gap: '12px',
                }}
              >
                {AVATAR_SEEDS.map((seed) => {
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
                        position: 'relative',
                      }}
                    >
                      <img
                        src={avatarUrl}
                        alt={seed}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                          borderRadius: '4px',
                        }}
                      />
                      {isCurrent && (
                        <div
                          style={{
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
                            fontWeight: 'bold',
                          }}
                        >
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(55, 53, 47, 0.09)',
            backgroundColor: 'rgba(55, 53, 47, 0.03)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: '11px',
              color: 'rgba(55, 53, 47, 0.5)',
            }}
          >
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
