import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useAuth, api, LogoLoader } from '../../../shared';
import AvatarPicker from '../components/AvatarPicker';
import EmailPreferences from '../components/EmailPreferences';
import DataPrivacy from '../components/DataPrivacy';
import { 
  MdPerson, MdEmail, MdLock, MdWork, MdLocationOn, MdLanguage
} from 'react-icons/md';
import { 
  FaLinkedin, FaBehance, FaInstagram, FaFacebook, FaTwitter, FaGithub, FaDribbble
} from 'react-icons/fa';

const Profile = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      const response = await api.get('/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
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
    setSaving(true);
    try {
      await api.put('/profile', profile);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
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
        <LogoLoader text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ marginBottom: '4px' }}>Profile Settings</h1>
        <p className="page-subtitle">
          Manage your profile information and preferences
        </p>
      </div>

      {/* View Toggle Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        <button 
          onClick={() => setActiveTab('profile')} 
          className={`view-toggle ${activeTab === 'profile' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MdPerson /> Profile Info
        </button>
        <button 
          onClick={() => setActiveTab('email')} 
          className={`view-toggle ${activeTab === 'email' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MdEmail /> Email Preferences
        </button>
        <button 
          onClick={() => setActiveTab('privacy')} 
          className={`view-toggle ${activeTab === 'privacy' ? 'active' : ''}`}
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <MdLock /> Data & Privacy
        </button>
      </div>

      {/* Profile Info Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSubmit}>
          {/* Avatar Section */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600' }}>
              Profile Picture
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img
                src={profile.profile_picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&size=80&background=8b5cf6&color=fff`}
                alt="Profile"
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <button
                type="button"
                onClick={() => setShowAvatarPicker(true)}
                className="btn-edit"
              >
                Change Avatar
              </button>
            </div>
          </div>

          {/* Basic Info */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600' }}>
              Basic Information
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={profile.name}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={profile.username}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdWork style={{ fontSize: '14px' }} />
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
                  <MdLocationOn style={{ fontSize: '14px' }} />
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profile.location}
                  onChange={handleChange}
                  placeholder="e.g. New York, USA"
                  className="form-input"
                />
              </div>
            </div>

            <div style={{ marginTop: '16px' }}>
              <label className="form-label">Bio</label>
              <textarea
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                rows={4}
                className="form-input"
                style={{ resize: 'vertical' }}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
            <h3 style={{ fontSize: '16px', marginBottom: '20px', fontWeight: '600' }}>
              Social Links
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <div>
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MdLanguage style={{ fontSize: '14px' }} />
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
                <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FaLinkedin style={{ fontSize: '14px' }} />
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
                  <FaTwitter style={{ fontSize: '14px' }} />
                  Twitter
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
                  <FaGithub style={{ fontSize: '14px' }} />
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
                  <FaBehance style={{ fontSize: '14px' }} />
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
                  <FaDribbble style={{ fontSize: '14px' }} />
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
              Profile Visibility
            </h3>
            <select
              name="profile_visibility"
              value={profile.profile_visibility}
              onChange={handleChange}
              className="form-input"
              style={{ maxWidth: '300px' }}
            >
              <option value="public">Public - Anyone can view your profile</option>
              <option value="private">Private - Only you can see your profile</option>
            </select>
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
      )}

      {/* Email Preferences Tab */}
      {activeTab === 'email' && (
        <EmailPreferences />
      )}

      {/* Data & Privacy Tab */}
      {activeTab === 'privacy' && (
        <DataPrivacy />
      )}

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
