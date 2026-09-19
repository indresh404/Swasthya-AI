// src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import '../styles/profile.css';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, isAuthenticated, loading, updateProfile, logout } = useAuth();
  const [editingSection, setEditingSection] = useState<'personal' | 'professional' | 'availability' | 'about' | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Local form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    languages: '',
    specialization: '',
    qualification: '',
    registrationNumber: '',
    yearsOfExperience: '',
    aboutMe: '',
    consultationFee: '',
    timings: ''
  });

  // Sync state with user context
  useEffect(() => {
    if (user || profile) {
      setFormData({
        fullName: user?.fullName || profile?.full_name || 'Dr. Divya Sharma',
        email: user?.email || profile?.email || 'divya.sharma@swasthya.com',
        phone: user?.phoneNumber || profile?.phone_number || '7559302315',
        dateOfBirth: user?.dateOfBirth || profile?.date_of_birth || '1966-08-15',
        gender: user?.gender || profile?.gender || 'Female',
        languages: user?.languages || profile?.languages || 'English, Hindi, Marathi',
        specialization: user?.specialization || profile?.specialization || 'General Physician / Internal Medicine',
        qualification: user?.qualification || profile?.qualification || 'MBBS, MD (Internal Medicine)',
        registrationNumber: user?.registrationNumber || profile?.registration_number || 'MCI-12345',
        yearsOfExperience: user?.yearsOfExperience || profile?.years_of_experience || '35 Years',
        aboutMe: user?.aboutMe || profile?.about_me || 'Dr. Divya Sharma is a veteran of internal medicine in Mumbai, focusing on preventive care, lifestyle disease management, and family health memory tracing.',
        consultationFee: user?.consultationFee || profile?.consultation_fee || '500',
        timings: user?.timings || profile?.timings || '10:00 AM - 5:00 PM'
      });
    }
  }, [user, profile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const startEditing = (section: 'personal' | 'professional' | 'availability' | 'about') => {
    setEditingSection(section);
    setSaveMessage(null);
  };

  const cancelEditing = () => {
    setEditingSection(null);
    if (user || profile) {
      setFormData({
        fullName: user?.fullName || profile?.full_name || 'Dr. Divya Sharma',
        email: user?.email || profile?.email || 'divya.sharma@swasthya.com',
        phone: user?.phoneNumber || profile?.phone_number || '7559302315',
        dateOfBirth: user?.dateOfBirth || profile?.date_of_birth || '1966-08-15',
        gender: user?.gender || profile?.gender || 'Female',
        languages: user?.languages || profile?.languages || 'English, Hindi, Marathi',
        specialization: user?.specialization || profile?.specialization || 'General Physician / Internal Medicine',
        qualification: user?.qualification || profile?.qualification || 'MBBS, MD (Internal Medicine)',
        registrationNumber: user?.registrationNumber || profile?.registration_number || 'MCI-12345',
        yearsOfExperience: user?.yearsOfExperience || profile?.years_of_experience || '35 Years',
        aboutMe: user?.aboutMe || profile?.about_me || 'Dr. Divya Sharma is a veteran of internal medicine in Mumbai, focusing on preventive care, lifestyle disease management, and family health memory tracing.',
        consultationFee: user?.consultationFee || profile?.consultation_fee || '500',
        timings: user?.timings || profile?.timings || '10:00 AM - 5:00 PM'
      });
    }
  };

  const handleSaveSection = async () => {
    setSaving(true);
    setSaveMessage(null);

    try {
      await updateProfile({
        full_name: formData.fullName,
        email: formData.email,
        phone_number: formData.phone,
        date_of_birth: formData.dateOfBirth,
        gender: formData.gender,
        languages: formData.languages,
        specialization: formData.specialization,
        qualification: formData.qualification,
        registration_number: formData.registrationNumber,
        years_of_experience: formData.yearsOfExperience,
        about_me: formData.aboutMe,
        consultation_fee: formData.consultationFee,
        timings: formData.timings
      });

      setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditingSection(null);
    } catch (err: any) {
      console.error('Error saving profile:', err);
      setSaveMessage({ type: 'error', text: err.message || 'Failed to save profile changes' });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  };

  const getInitials = (name: string) => {
    if (!name) return 'DS';
    return name
      .replace(/^Dr\.\s*/i, '')
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-wrapper">
        <div className="profile-loading">
          <div className="spinner"></div>
          <p>Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="profile-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 120px)', padding: '24px' }}>
        <div className="profile-not-logged-in">
          <div className="lock-icon-wrapper">
            <svg width="40" height="70" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h2>Please Log In</h2>
          <p>You need to be logged into Doctor Hub to view and manage practitioner settings.</p>
          <button className="profile-login-btn" onClick={() => navigate('/auth')}>
            Go to Doctor Hub &rarr;
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-wrapper">
      {/* Toast Alert */}
      {saveMessage && (
        <div className={`profile-toast-message ${saveMessage.type}`}>
          {saveMessage.text}
        </div>
      )}

      {/* Hero Header Profile Card */}
      <div className="profile-hero-card">
        <div className="profile-hero-cover" />
        <div className="profile-hero-body">
          <div className="profile-hero-top-row">
            <div className="profile-avatar-container">
              <div className="doc-hero-avatar-large">
                {getInitials(formData.fullName)}
              </div>
              <span className="profile-status-dot" title="Online Practitioner" />
            </div>
          </div>

          <div className="profile-hero-details">
            <div className="profile-hero-header-row">
              <div className="profile-hero-title-box">
                <h1 className="profile-hero-name">{formData.fullName}</h1>
                <span className="profile-verified-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified Doctor
                </span>
              </div>

              <div className="profile-hero-actions">
                <button className="logout-action-btn" onClick={logout}>
                  Sign Out
                </button>
              </div>
            </div>

            <p className="profile-hero-subtitle">
              {formData.specialization} &bull; {formData.qualification}
            </p>

            {/* Quick Badges Bar */}
            <div className="profile-hero-badges">
              <div className="hero-stat-pill">
                <span className="stat-label">Degree:</span>
                <span>{formData.qualification || 'MBBS, MD'}</span>
              </div>
              <div className="hero-stat-pill">
                <span className="stat-label">Exp:</span>
                <span>{formData.yearsOfExperience || '35 Years'}</span>
              </div>
              <div className="hero-stat-pill">
                <span className="stat-label">Reg:</span>
                <span>{formData.registrationNumber || 'MCI-12345'}</span>
              </div>
              <div className="hero-stat-pill highlight">
                <span className="stat-label">Fee:</span>
                <span>₹{formData.consultationFee || '500'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid Layout of Cards */}
      <div className="profile-grid">
        {/* Left Column */}
        <div className="profile-col">
          {/* Personal Info Card */}
          <div className={`profile-section-card ${editingSection === 'personal' ? 'is-editing' : ''}`}>
            <div className="section-card-header">
              <div className="section-title-box">
                <h3>Personal Information</h3>
              </div>
              {editingSection === 'personal' ? (
                <div className="edit-btn-group">
                  <button className="btn-save-section" onClick={handleSaveSection} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-section" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn-edit-section" onClick={() => startEditing('personal')}>
                  Edit
                </button>
              )}
            </div>

            <div className="section-card-body">
              <div className="field-grid">
                <div className="field-item">
                  <label>Full Name</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.fullName || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Email Address</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="email"
                      className="field-input"
                      value={formData.email}
                      onChange={e => handleInputChange('email', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.email || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Phone Number</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="tel"
                      className="field-input"
                      value={formData.phone}
                      onChange={e => handleInputChange('phone', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.phone || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Date of Birth</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="date"
                      className="field-input"
                      value={formData.dateOfBirth}
                      onChange={e => handleInputChange('dateOfBirth', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.dateOfBirth || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Gender</label>
                  {editingSection === 'personal' ? (
                    <select
                      className="field-input"
                      value={formData.gender}
                      onChange={e => handleInputChange('gender', e.target.value)}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    <div className="field-value">{formData.gender || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Languages Spoken</label>
                  {editingSection === 'personal' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.languages}
                      onChange={e => handleInputChange('languages', e.target.value)}
                      placeholder="e.g. English, Hindi, Marathi"
                    />
                  ) : (
                    <div className="field-value">{formData.languages || 'Not provided'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* About Doctor Card */}
          <div className={`profile-section-card ${editingSection === 'about' ? 'is-editing' : ''}`}>
            <div className="section-card-header">
              <div className="section-title-box">
                <h3>About Doctor</h3>
              </div>
              {editingSection === 'about' ? (
                <div className="edit-btn-group">
                  <button className="btn-save-section" onClick={handleSaveSection} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-section" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn-edit-section" onClick={() => startEditing('about')}>
                  Edit
                </button>
              )}
            </div>

            <div className="section-card-body">
              {editingSection === 'about' ? (
                <textarea
                  className="field-textarea"
                  rows={5}
                  value={formData.aboutMe}
                  onChange={e => handleInputChange('aboutMe', e.target.value)}
                  placeholder="Describe your medical experience, focus areas, and philosophy..."
                />
              ) : (
                <p className="about-text-content">
                  {formData.aboutMe || 'No detailed biography provided.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="profile-col">
          {/* Professional Credentials Card */}
          <div className={`profile-section-card ${editingSection === 'professional' ? 'is-editing' : ''}`}>
            <div className="section-card-header">
              <div className="section-title-box">
                <h3>Professional Credentials</h3>
              </div>
              {editingSection === 'professional' ? (
                <div className="edit-btn-group">
                  <button className="btn-save-section" onClick={handleSaveSection} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-section" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn-edit-section" onClick={() => startEditing('professional')}>
                  Edit
                </button>
              )}
            </div>

            <div className="section-card-body">
              <div className="field-grid">
                <div className="field-item">
                  <label>Specialization</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.specialization}
                      onChange={e => handleInputChange('specialization', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.specialization || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Qualification</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.qualification}
                      onChange={e => handleInputChange('qualification', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.qualification || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>MCI Registration Number</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.registrationNumber}
                      onChange={e => handleInputChange('registrationNumber', e.target.value)}
                    />
                  ) : (
                    <div className="field-value highlight-text">{formData.registrationNumber || 'Not provided'}</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Years of Experience</label>
                  {editingSection === 'professional' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.yearsOfExperience}
                      onChange={e => handleInputChange('yearsOfExperience', e.target.value)}
                    />
                  ) : (
                    <div className="field-value">{formData.yearsOfExperience || 'Not provided'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Availability & Practice Card */}
          <div className={`profile-section-card ${editingSection === 'availability' ? 'is-editing' : ''}`}>
            <div className="section-card-header">
              <div className="section-title-box">
                <h3>Practice & Consultation Fees</h3>
              </div>
              {editingSection === 'availability' ? (
                <div className="edit-btn-group">
                  <button className="btn-save-section" onClick={handleSaveSection} disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button className="btn-cancel-section" onClick={cancelEditing} disabled={saving}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn-edit-section" onClick={() => startEditing('availability')}>
                  Edit
                </button>
              )}
            </div>

            <div className="section-card-body">
              <div className="field-grid">
                <div className="field-item">
                  <label>Consultation Fee (₹)</label>
                  {editingSection === 'availability' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.consultationFee}
                      onChange={e => handleInputChange('consultationFee', e.target.value)}
                      placeholder="e.g. 500"
                    />
                  ) : (
                    <div className="field-value highlight-fee">₹{formData.consultationFee || '500'} per visit</div>
                  )}
                </div>

                <div className="field-item">
                  <label>Clinic Hours / Timings</label>
                  {editingSection === 'availability' ? (
                    <input
                      type="text"
                      className="field-input"
                      value={formData.timings}
                      onChange={e => handleInputChange('timings', e.target.value)}
                      placeholder="e.g. 10:00 AM - 5:00 PM"
                    />
                  ) : (
                    <div className="field-value">{formData.timings || '10:00 AM - 5:00 PM'}</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;