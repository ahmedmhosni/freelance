import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import LogoLoader from '../components/LogoLoader';
import SEO from '../components/SEO';
import { MdWork, MdLocationOn, MdLanguage, MdArrowBack } from 'react-icons/md';
import {
  FaLinkedin,
  FaBehance,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaGithub,
  FaDribbble,
} from 'react-icons/fa';

const PublicProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/api/profile/${username}`);
      setProfile(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError(error.response?.data?.message || 'Profile not found');
    } finally {
      setLoading(false);
    }
  };

  const socialLinks = [
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      url: profile?.linkedin,
      color: '#0077b5',
    },
    {
      name: 'Behance',
      icon: FaBehance,
      url: profile?.behance,
      color: '#1769ff',
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: profile?.instagram,
      color: '#E4405F',
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      url: profile?.facebook,
      color: '#1877f2',
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: profile?.twitter,
      color: '#1DA1F2',
    },
    {
      name: 'GitHub',
      icon: FaGithub,
      url: profile?.github,
      color: isDark ? '#fff' : '#333',
    },
    {
      name: 'Dribbble',
      icon: FaDribbble,
      url: profile?.dribbble,
      color: '#ea4c89',
    },
  ].filter((link) => link.url); // Only show links that have URLs

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
        }}
      >
        <LogoLoader size={80} text="" />
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: isDark ? '#1a1a2e' : '#ffffff',
          padding: '20px',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            maxWidth: '500px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              marginBottom: '20px',
              opacity: 0.5,
            }}
          >
            🔒
          </div>
          <h1
            style={{
              fontSize: '24px',
              marginBottom: '12px',
              color: isDark ? 'rgba(255,255,255,0.9)' : '#37352f',
            }}
          >
            Profile Not Found
          </h1>
          <p
            style={{
              fontSize: '14px',
              marginBottom: '24px',
              color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(55,53,47,0.6)',
            }}
          >
            {error}
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '500',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <MdArrowBack />
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // Generate SEO meta tags
  const profileTitle = profile?.name
    ? `${profile.name} - ${profile.job_title || 'Freelancer'}`
    : 'Freelancer Profile';
  const profileDescription =
    profile?.bio ||
    `View ${profile?.name || 'freelancer'}'s professional profile on Roastify. ${profile?.job_title ? `${profile.job_title} specializing in professional services.` : ''}`;
  const profileUrl = `https://roastify.online/profile/${username}`;
  const profileImage =
    profile?.profile_picture || 'https://roastify.online/og-image.png';

  return (
    <>
      <SEO
        title={profileTitle}
        description={profileDescription}
        url={profileUrl}
        image={profileImage}
        type="profile"
        keywords={`${profile?.name}, ${profile?.job_title}, freelancer, ${profile?.location}, professional profile`}
      />

      <div
        style={{
          minHeight: '100vh',
          backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '900px',
            margin: '0 auto',
          }}
        >
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: 'transparent',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              marginBottom: '24px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              color: isDark ? 'rgba(255,255,255,0.9)' : '#37352f',
            }}
          >
            <MdArrowBack />
            Back
          </button>

          {/* Profile Header Card */}
          <div
            style={{
              backgroundColor: isDark ? '#2d2d44' : '#ffffff',
              borderRadius: '12px',
              padding: '40px',
              marginBottom: '24px',
              boxShadow: isDark
                ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                : '0 2px 8px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            {/* Profile Picture */}
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: isDark ? '#1a1a2e' : '#f0f0f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '48px',
                fontWeight: '600',
                color: isDark ? '#a78bfa' : '#8b5cf6',
                margin: '0 auto 24px',
                overflow: 'hidden',
                border: `4px solid ${isDark ? '#3d3d5c' : '#e0e0e0'}`,
              }}
            >
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={profile.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                profile.name?.charAt(0)?.toUpperCase() || 'U'
              )}
            </div>

            {/* Name and Title */}
            <h1
              style={{
                fontSize: '32px',
                marginBottom: '8px',
                color: isDark ? 'rgba(255,255,255,0.9)' : '#37352f',
              }}
            >
              {profile.name}
            </h1>

            {profile.job_title && (
              <p
                style={{
                  fontSize: '18px',
                  marginBottom: '8px',
                  color: isDark
                    ? 'rgba(255,255,255,0.7)'
                    : 'rgba(55,53,47,0.7)',
                  fontWeight: '500',
                }}
              >
                <MdWork
                  style={{ verticalAlign: 'middle', marginRight: '8px' }}
                />
                {profile.job_title}
              </p>
            )}

            {profile.location && (
              <p
                style={{
                  fontSize: '14px',
                  marginBottom: '20px',
                  color: isDark
                    ? 'rgba(255,255,255,0.6)'
                    : 'rgba(55,53,47,0.6)',
                }}
              >
                <MdLocationOn
                  style={{ verticalAlign: 'middle', marginRight: '4px' }}
                />
                {profile.location}
              </p>
            )}

            {/* Bio */}
            {profile.bio && (
              <p
                style={{
                  fontSize: '16px',
                  lineHeight: '1.6',
                  marginTop: '24px',
                  maxWidth: '600px',
                  margin: '24px auto 0',
                  color: isDark
                    ? 'rgba(255,255,255,0.8)'
                    : 'rgba(55,53,47,0.8)',
                }}
              >
                {profile.bio}
              </p>
            )}

            {/* Social Links */}
            {socialLinks.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '16px',
                  marginTop: '32px',
                  flexWrap: 'wrap',
                }}
              >
                {socialLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={link.name}
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: isDark ? '#1a1a2e' : '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: link.color,
                        transition: 'transform 0.2s, box-shadow 0.2s',
                        textDecoration: 'none',
                        border: `2px solid ${isDark ? '#3d3d5c' : '#e0e0e0'}`,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-4px)';
                        e.currentTarget.style.boxShadow = isDark
                          ? '0 8px 16px rgba(0,0,0,0.4)'
                          : '0 8px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <Icon />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Website & Portfolio Links */}
          {(profile.website || profile.portfolio) && (
            <div
              style={{
                backgroundColor: isDark ? '#2d2d44' : '#ffffff',
                borderRadius: '12px',
                padding: '24px',
                marginBottom: '24px',
                boxShadow: isDark
                  ? '0 4px 6px rgba(0, 0, 0, 0.3)'
                  : '0 2px 8px rgba(0, 0, 0, 0.1)',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  marginBottom: '16px',
                  fontWeight: '600',
                  color: isDark ? 'rgba(255,255,255,0.9)' : '#37352f',
                }}
              >
                <MdLanguage
                  style={{ verticalAlign: 'middle', marginRight: '8px' }}
                />
                Links
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}
              >
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px 16px',
                      backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#8b5cf6',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? '#252540'
                        : '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? '#1a1a2e'
                        : '#f8f9fa';
                    }}
                  >
                    <MdLanguage />
                    Website
                  </a>
                )}

                {profile.portfolio && (
                  <a
                    href={profile.portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '12px 16px',
                      backgroundColor: isDark ? '#1a1a2e' : '#f8f9fa',
                      borderRadius: '8px',
                      textDecoration: 'none',
                      color: '#8b5cf6',
                      fontSize: '14px',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? '#252540'
                        : '#f0f0f0';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDark
                        ? '#1a1a2e'
                        : '#f8f9fa';
                    }}
                  >
                    <MdLanguage />
                    Portfolio
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '40px',
              padding: '20px',
              color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(55,53,47,0.5)',
              fontSize: '13px',
            }}
          >
            <p>
              Powered by{' '}
              <a href="/" style={{ color: '#8b5cf6', textDecoration: 'none' }}>
                Roastify
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default PublicProfile;
