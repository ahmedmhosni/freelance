import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import toast from 'react-hot-toast';
import LogoLoader from '../components/LogoLoader';
import AvatarPicker from '../components/AvatarPicker';
import EmailPreferences from '../components/EmailPreferences';
import DataPrivacy from '../components/DataPrivacy';
import logger from '../utils/logger';
import { 
  MdPerson, MdWork, MdLocationOn, MdLanguage,
  MdContentCopy, MdCheck
} from 'react-icons/md';
import { 
  FaLinkedin, FaBehance, FaInstagram, FaFacebook, FaTwitter, FaGithub, FaDribbble
} from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [profile, setProfile] = useState({
    name: '',
    username: '',
    job_title: '',
    bio: '',
    profile_picture: '',
    location: '',
    website: '',
    linkedin: '',
    behance: '',
    instagram: '',
    facebook: '',
    twitter: '',
    github: '',
    dribbble: '',
    portfolio: '',
    profile_visibility: 'public'
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/profile/me');
      setProfile({
        name: response.data.name || '',
        username: response.data.username || '',
        job_title: response.data.job_title || '',
        bio: response.data.bio || '',
        profile_picture: response.data.profile_picture || '',
        location: response.data.location || '',
        website: response.data.website || '',
        linkedin: response.data.linkedin || '',
        behance: response.data.behance || '',
        instagram: response.data.instagram || '',
        facebook: response.data.facebook || '',
        twitter: response.data.twitter || '',
        github: response.data.github || '',
        dribbble: response.data.dribbble || '',
        portfolio: response.data.portfolio || '',
        profile_visibility: response.data.profile_visibility || 'public'
      });
    } catch (error) {
      logger.error('Error fetching profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      await api.put('/api/profile/me', profile);
      toast.success('Profile updated successfully!');
    } catch (error) {
      logger.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = () => {
    if (profile.username) {
      const link = `${window.location.origin}/profile/${profile.username}`;
      navigator.clipboard.writeText(link);
      setCopied(true);
      toast.success('Profile link copied!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Please set a username first');
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh' 
      }}>
        <LogoLoader size={80} text="" />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ marginBottom: '4px' }}>Profile Settings</h1>
        <p className="page-subtitle">
          Manage your public profile and personal information
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Profile Preview Card */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: isDark ? '#2d2d44' : '#f0f0f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              fontWeight: '600',
              color: isDark ? '#a78bfa' : '#8b5cf6',
              overflow: 'hidden'
            }}>
              {profile.profile_picture ? (
                <img src={profile.profile_picture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ margin: 0, fontSize: '20px' }}>{profile.name || user?.name}</h2>
              {profile.job_title && (
                <p style={{ margin: '4px 0 0 0', opacity: 0.7, fontSize: '14px' }}>{profile.job_title}</p>
              )}
              {profile.username && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', opacity: 0.6 }}>
                    roastify.online/profile/{profile.username}
                  </span>
                  <button
                    type="button"
                    onClick={copyProfileLink}
                    className="btn-edit"
                    style={{
                      padding: '4px 8px',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {copied ? <MdCheck size={14} /> : <MdContentCopy size={14} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdPerson style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
            Basic Information
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Username (for public profile)
              </label>
              <input
                type="text"
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="your-username"
                className="form-input"
              />
              <small style={{ fontSize: '12px', opacity: 0.6 }}>
                Letters, numbers, underscores, and hyphens only
              </small>
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MdWork style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Job Title
              </label>
              <input
                type="text"
                name="job_title"
                value={profile.job_title}
                onChange={handleChange}
                placeholder="e.g. Freelance Designer"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <MdLocationOn style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Location
              </label>
              <input
                type="text"
                name="location"
                value={profile.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="form-input"
              />
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="form-label">
              Bio
            </label>
            <textarea
              name="bio"
              value={profile.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              maxLength="500"
              className="form-input"
              style={{ resize: 'vertical' }}
            />
            <small style={{ fontSize: '12px', opacity: 0.6 }}>
              {profile.bio.length}/500 characters
            </small>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label className="form-label">
              Profile Picture
            </label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="btn-primary"
              >
                Choose Avatar
              </button>
              {profile.profile_picture && (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: '2px solid rgba(55, 53, 47, 0.16)'
                }}>
                  <img 
                    src={profile.profile_picture} 
                    alt="Preview" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>
            <small style={{ display: 'block', marginTop: '6px', color: 'rgba(55, 53, 47, 0.65)', fontSize: '12px' }}>
              Choose from our character avatar library
            </small>
          </div>
        </div>

        {/* Website & Portfolio */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MdLanguage style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
            Website & Portfolio
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={profile.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label">
                Portfolio
              </label>
              <input
                type="url"
                name="portfolio"
                value={profile.portfolio}
                onChange={handleChange}
                placeholder="https://portfolio.com"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600' }}>
            Social Media Links
          </h3>
          <p style={{ fontSize: '13px', opacity: 0.7, marginBottom: '20px' }}>
            Only filled links will be displayed on your public profile
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaLinkedin style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedin"
                value={profile.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaBehance style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Behance
              </label>
              <input
                type="url"
                name="behance"
                value={profile.behance}
                onChange={handleChange}
                placeholder="https://behance.net/username"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaInstagram style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Instagram
              </label>
              <input
                type="url"
                name="instagram"
                value={profile.instagram}
                onChange={handleChange}
                placeholder="https://instagram.com/username"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaFacebook style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Facebook
              </label>
              <input
                type="url"
                name="facebook"
                value={profile.facebook}
                onChange={handleChange}
                placeholder="https://facebook.com/username"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaTwitter style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Twitter / X
              </label>
              <input
                type="url"
                name="twitter"
                value={profile.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaGithub style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                GitHub
              </label>
              <input
                type="url"
                name="github"
                value={profile.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="form-input"
              />
            </div>

            <div>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FaDribbble style={{ color: 'var(--primary-color)', fontSize: '14px' }} />
                Dribbble
              </label>
              <input
                type="url"
                name="dribbble"
                value={profile.dribbble}
                onChange={handleChange}
                placeholder="https://dribbble.com/username"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Privacy Settings */}
        <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600' }}>
            Privacy Settings
          </h3>
          
          <div>
            <label className="form-label">
              Profile Visibility
            </label>
            <select
              name="profile_visibility"
              value={profile.profile_visibility}
              onChange={handleChange}
              className="form-input"
              style={{ maxWidth: '300px' }}
            >
              <option value="public">
                Public - Anyone can view your profile
              </option>
              <option value="private">
                Private - Only you can see your profile
              </option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={fetchProfile}
            disabled={saving}
            className="btn-edit"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Email Preferences */}
      <div style={{ marginTop: '24px' }}>
        <EmailPreferences />
      </div>

      {/* Data & Privacy (GDPR) */}
      <div style={{ marginTop: '24px' }}>
        <DataPrivacy />
      </div>

      {/* Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={profile.profile_picture}
          onSelect={(avatarUrl) => {
            setProfile({ ...profile, profile_picture: avatarUrl });
            toast.success('Avatar selected!');
          }}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
};

export default Profile;
